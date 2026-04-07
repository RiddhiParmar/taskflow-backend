import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import DatabaseModule from './common/database/database.module';
import { ENV_NAMESPACES, validateEnv } from './config';
import databaseConfig from './config/config-list/database.config';
import loggerConfig from './config/config-list/logger.config';
import serverConfig from './config/config-list/server.config';
import swaggerConfig from './config/config-list/swagger.config';
import mailerConfig from './config/config-list/mailer.config';
import { TaskModule } from './component/task/task.module';
import { UserModule } from './component/user/user.module';

@Module({
  imports: [
    // Configure environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      load: [
        serverConfig,
        databaseConfig,
        loggerConfig,
        swaggerConfig,
        mailerConfig,
      ],
    }),
    // Configure logging
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const loggerConfigurations = configService.get(
          `${ENV_NAMESPACES.LOGGER}.pinoHttp`,
        );
        return {
          pinoHttp: loggerConfigurations,
        };
      },
    }),
    DatabaseModule.forRoot(),
    UserModule,
    TaskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
