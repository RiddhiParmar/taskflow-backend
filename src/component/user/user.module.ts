import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User, UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RouteInfo } from '@nestjs/common/interfaces';
import { JwtAuthModule } from '../../common/jwt/jwt.module';
import { AuthenticationMiddleware } from '../../common/authentication/authentication.middleware';
import { MailerModule } from '../../common/mailer/mailer.module';
import { UserAuthController } from './controller/userauth.controller';

const excludeUserRoute: Array<string | RouteInfo> = [
  {
    path: '/user/auth',
    method: RequestMethod.POST,
  },
  '/user/auth/login',
  '/user/auth/forget-password-token',
  '/user/forget-reset-password',
];

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtAuthModule,
    MailerModule,
  ],
  controllers: [UserAuthController, UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(...excludeUserRoute)
      .forRoutes(UserController);
  }
}
