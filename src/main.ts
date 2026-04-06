import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { Logger as PinoLogger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { swagger } from './common/swagger/swagger';
import { ENV_NAMESPACES, NODE_ENV } from './config';
import * as crypto from 'crypto';
import { GlobalExceptionFilter } from './common/exception/http-exception.filter';

const logger = new Logger('main');

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    // attach pino logger
    app.useLogger(app.get(PinoLogger));

    const configService = app.get(ConfigService);

    //Swagger (only in dev/local)
    const env = configService.get(`${ENV_NAMESPACES.SERVER}.environment`);
    if ([NODE_ENV.DEVELOPMENT, NODE_ENV.LOCAL].includes(env)) {
      swagger(app, configService);
    }

    // Global filters & pipes
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    app.use(helmet({
       contentSecurityPolicy: false,
       crossOriginEmbedderPolicy: false,
    }));

   app.enableCors(configService.get<number>(`${ENV_NAMESPACES.SERVER}.cors`));

   app.enableShutdownHooks();

    // Attach Request ID middleware
    app.use((req: any, res: any, next: () => void) => {
      req.id = crypto.randomUUID();
      res.setHeader('x-request-id', req.id);
      next();
    });

    //Start server
    const port = configService.get<number>(`${ENV_NAMESPACES.SERVER}.port`) ?? 3000;
    const host = configService.get<string>(`${ENV_NAMESPACES.SERVER}.host`) ?? '0.0.0.0';

    await app.listen(port, host);

    logger.log(`App running at: ${await app.getUrl()}`);
}
// start app
bootstrap().catch((err) => {
  logger.error({ err }, `Error in bootstrap() start-up`);
});