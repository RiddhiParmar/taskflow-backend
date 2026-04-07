import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../component/user/user.repository';
import { JwtAuthService } from '../jwt/jwt.services';
import { AUTH_ERROR_MESSAGE } from './authentication.errors';
import {
  USER_ERROR_CONST,
  USER_ERROR_MESSAGE,
} from '../../component/user/user.errors';
import { NextFunction, Response } from 'express';
import serverConfig from '../../config/config-list/server.config';
import { type ConfigType } from '@nestjs/config';
import { CustomRequest } from '../interface/custom.server.interface';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthenticationMiddleware.name);
  constructor(
    private readonly userRepository: UserRepository,
    @Inject(serverConfig.KEY)
    private readonly serverConfigurations: ConfigType<typeof serverConfig>,
    private readonly jwtService: JwtAuthService,
  ) {}

  async use(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | void> {
    res.setHeader(
      'Access-Control-Allow-Origin',
      this.serverConfigurations.frontendBaseUrl,
    );
    let authorizationToken = req.headers?.authorization;
    console.log('authorizationToken', authorizationToken);
    if (!authorizationToken) {
      this.logger.error('Authentication token missing in header');
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: AUTH_ERROR_MESSAGE.AUTH_FAILED,
        timestamp: new Date().toISOString(),
      });
    }
    try {
      authorizationToken = authorizationToken.replace('Bearer ', '');
      const decode = await this.jwtService.verifyToken(authorizationToken);
      const user = await this.userRepository.findOne({
        _id: decode._id,
        tokens: authorizationToken,
      });
      if (!user) {
        this.logger.error('User not found');
        throw new NotFoundException({
          code: USER_ERROR_CONST.USER_NOT_FOUND,
          message: USER_ERROR_MESSAGE.USER_NOT_FOUND,
        });
      }
      req.user = user;
      next();
    } catch (err) {
      this.logger.error({ err }, `JWT - Auth-Token is not valid`);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: AUTH_ERROR_MESSAGE.AUTH_TOKEN_NOT_VALID_FAILED,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
