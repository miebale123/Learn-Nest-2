// import {
//   ForgotPasswordDto,
//   ResetPasswordDto,
//   SigninDto,
//   SignupDto,
//   UpdatePasswordDto,
//   VerificationDto,
// } from './dto/auth-credentials.dto';
// import { User } from 'src/users/entities/user.entity';
// import { PasswordService } from './services/password.service';
// import type { Response } from 'express';
// import {
//   Body,
//   Controller,
//   Get,
//   HttpCode,
//   HttpStatus,
//   Param,
//   Patch,
//   Post,
//   Req,
//   Res,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { Throttle } from '@nestjs/throttler';
// import { AuthService } from './auth.service';
// import { GetRefreshToken, GetUser } from './decorators';
// import type { AuthInternal } from './interfaces';
// import { Public } from 'src/common/decorators';
// import { AuditExclude } from 'src/audit/audit-exclude.decorator';
// import { AuthGuard } from '@nestjs/passport';
// import express from 'express';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from 'src/users/users.service';
// import { InjectRepository } from '@nestjs/typeorm';
// import { UserSession } from 'src/users/entities/user-session.entity';
// import { Repository } from 'typeorm';
// import { compare, hash } from './bcrypt.util';
// import { TokenService } from './services/token.service';

// import { Injectable } from '@nestjs/common';


// @Injectable()
// export class SessionsService {
//   constructor(
//     @InjectRepository(UserSession)
//     private readonly sessionRepo: Repository<UserSession>,
//   ) {}

//   async createSession(userId: number, refreshToken: string): Promise<string> {
//     const hashedRefreshToken = await hash(refreshToken);

//     const session = this.sessionRepo.create({
//       userId,
//       hashedRefreshToken,
//       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
//       revoked: false,
//     });

//     await this.sessionRepo.save(session);
//     return refreshToken; // return raw token to client
//   }

//   async findSession(refreshToken: string, userId?: number | null) {
//     // find sessions for this user if userId is given,
//     // otherwise check all non-revoked sessions
//     const query: any = { revoked: false };
//     if (userId) query.userId = userId;

//     const sessions = await this.sessionRepo.find({ where: query });

//     for (const session of sessions) {
//       const match = await compare(refreshToken, session.hashedRefreshToken!);
//       if (match) return session;
//     }

//     return null;
//   }

//   async revokeSession(userId: number, refreshToken?: string) {
//     // Revoke one session (logout from one device)
//     if (refreshToken) {
//       const session = await this.findSession(refreshToken, userId);
//       if (session) {
//         await this.sessionRepo.update({ id: session.id }, { revoked: true });
//       }
//       return;
//     }

//     // Revoke ALL sessions (logout from all devices)
//     await this.sessionRepo.update({ userId }, { revoked: true });
//   }
// }

// export interface AuthUser {
//   email?: string;
//   provider: string;
//   providerId: string;
//   accessToken?: string;
// }
// @Controller('auth')
// export class AuthController {
//   constructor(
//     private readonly authService: AuthService,
//     private readonly jwtService: JwtService,
//     private readonly userService: UsersService,
//     private readonly sessionService: SessionsService,
//     private readonly tokenService: TokenService,
//   ) {}

//   @Public()
//   @Get('google')
//   @UseGuards(AuthGuard('google'))
//   async googleLogin() {}

//   @Public()
//   @Get('google/callback')
//   @UseGuards(AuthGuard('google'))
//   async googleCallback(
//     @Req() req: express.Request & { user?: AuthUser },
//     @Res() res: express.Response,
//   ) {
//     const gUser = req.user;

//     if (!gUser?.email) {
//       return res.status(400).send('Authentication failed');
//     }

//     // 1. Find or create user
//     let appUser = await this.userService.findByEmail(gUser.email);

//     if (!appUser) {
//       appUser = await this.userService.createUser(
//         gUser.email,
//         null,
//         null,
//         gUser.providerId,
//         gUser.provider,
//       );
//     }

//     // 2. Create a session (Google login = separate session)
//     const refreshToken = await this.tokenService.getRefreshToken();
//     await this.sessionService.createSession(appUser.id, refreshToken);

//     // 3. Create access token
//     const accessToken = this.jwtService.sign({
//       email: appUser.email,
//       sub: appUser.id,
//       roles: ['user'],
//     });

//     // 4. Store refresh token cookie
//     res.cookie('refresh-token', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: '/',
//     });

//     return res.redirect(
//       `http://localhost:4200/oauth-login?token=${accessToken}&email=${encodeURIComponent(
//         appUser.email,
//       )}`,
//     );
//   }

//   @Public()
//   @Post('refresh')
//   async refresh(
//     @GetRefreshToken() oldRefreshToken: string,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     const session = await this.sessionService.findSession(oldRefreshToken);
//     if (!session) return { message: 'Session not found' };

//     const user = await this.userService.findById(session.userId);
//     if (!user) return { message: 'User not found' };

//     // revoke old session
//     await this.sessionService.revokeSession(session.userId, oldRefreshToken);

//     // create new tokens & session
//     const accessToken = await this.tokenService.getAccessToken(user);
//     const newRefreshToken = await this.tokenService.getRefreshToken();
//     await this.sessionService.createSession(user.id, newRefreshToken);

//     // set cookie
//     res.cookie('refresh-token', newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       path: '/',
//     });

//     return {
//       email: user.email,
//       accessToken,
//       message: 'refreshed',
//     };
//   }

//   @Post('log-out')
//   async logOut(
//     @GetUser() user: User,
//     @Body('currentRefreshToken') currentRefreshToken: string,
//     @Res({ passthrough: true }) res: Response,
//   ) {
//     await this.sessionService.revokeSession(user.id, currentRefreshToken);

//     res.clearCookie('refresh-token', {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
//       path: '/',
//     });

//     return { message: 'logged out successfully' };
//   }
// }
