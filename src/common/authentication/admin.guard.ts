import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AUTH_ERROR_CONST, AUTH_ERROR_MESSAGE } from './authentication.errors';
import { UserRole } from '../../component/user/enum/user.enum';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException({
        code: AUTH_ERROR_CONST.UNAUTHORIZED_ACCESS,
        message: AUTH_ERROR_MESSAGE.UNAUTHORIZED_ACCESS,
      });
    }
    return true;
  }
}
