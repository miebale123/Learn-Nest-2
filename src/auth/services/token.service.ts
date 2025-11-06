import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { SessionsService } from './session.service';
import type { User } from 'src/users/entities/user.entity';
import type { JwtPayload } from '../interfaces';
import { hash } from '../bcrypt.util';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionsService,
  ) {}

  async generateAccessToken(user: User) {
    // Make sure roles are loaded (userRoles relation)
    const roles = user.userRoles?.map((ur) => ur.role.name) || [];
    console.log('user roles are ', roles);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });

    return accessToken;
  }

  async generateRefreshToken() {
    const refreshToken = crypto.randomBytes(64).toString('hex');
    return refreshToken;
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  async decodeToken(token: string): Promise<JwtPayload> {
    return this.jwtService.decode(token);
  }
}
