import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSession } from 'src/users/entities/user-session.entity';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { compare, hash } from '../bcrypt.util';
@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepo: Repository<UserSession>,
  ) {}

  async createSession(userId: number, refreshToken: string): Promise<string> {
    const hashedRefreshToken = await hash(refreshToken);

    const session = this.sessionRepo.create({
      userId,
      hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      revoked: false,
    });

    await this.sessionRepo.save(session);
    return refreshToken;
  }

  async findSession(refreshToken: string, userId: number) {
    const sessions = await this.sessionRepo.find({
      where: { userId, revoked: false },
    });

    console.log(sessions);

    for (const session of sessions) {
      const isMatch = await compare(refreshToken, session.hashedRefreshToken!);
      console.log('ismatch: ', isMatch);
      if (!isMatch) return null;
      return session;
    }
  }

  async revokeSession(userId: number, refreshToken?: string) {
    if (refreshToken) {
      // Revoke a single session
      const session = await this.findSession(refreshToken, userId);
      if (session) {
        session.revoked = true;
        await this.sessionRepo.save(session);
      }
    } else {
      // Revoke all sessions
      await this.sessionRepo.update({ userId }, { revoked: true });
    }
  }
}
