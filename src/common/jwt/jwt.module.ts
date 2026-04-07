import { Module } from '@nestjs/common';
import { JwtAuthService } from './jwt.services';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ENV_NAMESPACES } from '../../config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const jwtConfigurations = configService.get(
          `${ENV_NAMESPACES.SERVER}.jwtAuthentication`,
        );
        return {
          privateKey: jwtConfigurations.privateKeyToSignJWT.replace(
            /\\n/g,
            '\n',
          ),
          publicKey: jwtConfigurations.publicKeyToVerifyJWT.replace(
            /\\n/g,
            '\n',
          ),
          signOptions: jwtConfigurations.defaultOptions,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtAuthService],
})
export class JwtAuthModule {}
