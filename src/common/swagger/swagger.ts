import { applyDecorators, INestApplication } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ENV_NAMESPACES } from '../../config';

export function swagger(app: INestApplication, config: ConfigService): void {
  const options = new DocumentBuilder()
    .setTitle(config.get(`${ENV_NAMESPACES.SWAGGER}.title`)!)
    .setDescription(config.get(`${ENV_NAMESPACES.SWAGGER}.description`)!)
    .setVersion(config.get(`${ENV_NAMESPACES.SWAGGER}.version`)!)
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup(
    `${config.get(`${ENV_NAMESPACES.SWAGGER}.endpoint`)}`,
    app,
    document,
  );
}

// Custom decorator for all response type
export function AllPossibleResponses() {
  return applyDecorators(
    ApiBadRequestResponse({ description: 'BAD_REQUEST' }),
    ApiInternalServerErrorResponse({ description: 'INTERNAL_SERVER_ERROR' }),
    ApiUnauthorizedResponse({ description: 'UNAUTHORIZED' }),
  );
}
