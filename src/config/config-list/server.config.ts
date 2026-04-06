import { registerAs } from '@nestjs/config';
import { ENV_NAMESPACES, NODE_ENV } from '../config.tokens';
export default registerAs(ENV_NAMESPACES.SERVER, () => {
  return {
    port: parseInt(process.env.PORT as string, 10) || 8080,
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || NODE_ENV.DEVELOPMENT,
    cors: {
      origin: process.env?.CORS_ORIGIN?.split(',') || [
        process.env.FRONTEND_BASEURL,
      ],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Accept',
        'Content-Type',
        'Authorization',
        'x-verification-signature',
        'access-token',
        'customerId',
        'firmId',
      ],
      methods: ['GET', 'PUT', 'OPTIONS', 'POST', 'DELETE', 'PATCH'],
    },
    jwtAuthentication: {
      privateKeyToSignJWT: Buffer.from(
        process.env.PRIVATE_KEY!,
        'base64',
      ).toString('utf8'),
      publicKeyToVerifyJWT: Buffer.from(
        process.env.PUBLIC_KEY!,
        'base64',
      ).toString('utf8'),
      signOptions: {
        expiresIn: '3d', // 3 days
        algorithm: 'RS256',
      }
    },
  };
});
