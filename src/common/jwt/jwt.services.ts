import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  createToken(payload, options?): string {
    if (options) {
      return this.jwtService.sign(payload, options);
    }
    return this.jwtService.sign(payload);
  }

  decodeToken(token: string): string | { [p: string]: any } {
    return this.jwtService.decode(token);
  }

  verifyToken(token: string, options?) {
    if (options) {
      return this.jwtService.verify(token, options);
    }
    return this.jwtService.verify(token);
  }
}
