// import {
//   ForgotPasswordDto,
//   ResetPasswordDto,
//   SigninDto,
//   SignupDto,
//   UpdatePasswordDto,
//   VerificationDto,
// } from './dto/auth-credentials.dto';
// import { User } from 'src/users/entities/user.entity';
// import { AuthResponseInterceptor } from './interceptors/auth-response.interceptor';
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
//     private readonly passwordService: PasswordService,
//     private readonly jwtService: JwtService,
//     private readonly userService: UsersService,
//   ) {}

//   @Public()
//   @HttpCode(HttpStatus.CREATED)
//   @AuditExclude()
//   @Post('sign-up')
//   async signup(@Body() dto: SignupDto) {
//     return this.authService.signup(dto);
//   }

//   @Post('verify')
//   @UseInterceptors(AuthResponseInterceptor)
//   @Public()
//   async verifyEmail(@Body() dto: VerificationDto): Promise<AuthInternal> {
//     return await this.authService.verifyEmail(dto.otp);
//   }

//   @Public()
//   // @Throttle({ default: { limit: 60000, ttl: 5 } })
//   @AuditExclude()
//   @UseInterceptors(AuthResponseInterceptor)
//   @Post('sign-in')
//   async signin(@Body() dto: SigninDto): Promise<AuthInternal> {
//     return await this.authService.signin(dto);
//   }

//   @Get('/')
//   getRootAuth() {
//     return { message: 'Welcome to the Auth Service' };
//   }

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
//     const user = req.user;
//     console.log('User from passport:', user);
//     if (!user?.email) {
//       return res.status(400).send('Authentication failed');
//     }

//     // Create your own JWT now
//     const payload = {
//       email: user.email,
//       sub: user.providerId,
//       roles: ['user'],
//     };

//     const jwt = this.jwtService.sign(payload);
//     console.log('user:', user);

//     return res.redirect(
//       // `https://birhan-academy-iota.vercel.app/oauth-login?token=${jwt}&email=${encodeURIComponent(user.email)}`,
//       // `http://localhost:4200/?token=${jwt}&email=${encodeURIComponent(user.email)}`,
//       `http://localhost:4200/oauth-login?token=${jwt}&email=${encodeURIComponent(user.email)}`,
//     );
//   }

//   // @Throttle({ default: { limit: 60000, ttl: 3 } })
//   // @UseInterceptors(AuthResponseInterceptor)
//   // @Post('refresh')
//   // async refresh(
//   //   @GetUser() user: User,
//   //   @GetRefreshToken() oldRefreshToken: string,
//   // ) {
//   //   return this.authService.refresh(oldRefreshToken, user);
//   // }

//   @Post('log-out')
//   async logOut(
//     @GetUser() user: User,
//     @Body('currentRefreshToken') currentRefreshToken: string,
//     @Res({ passthrough: true }) res: Response,
//   ): Promise<{ message: string }> {
//     await this.authService.logout(user, currentRefreshToken);
//     res.clearCookie('refresh-token', {
//       httpOnly: true,
//       maxAge: 0,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       path: '/'
//     });

//     return { message: 'logged out succesfully' };
//   }

//   @Patch('update-password')
//   async updatePassword(
//     @GetUser() user: User,
//     @Body() dto: UpdatePasswordDto,
//   ): Promise<{ message: string }> {
//     await this.passwordService.updatePassword(user, dto);
//     return { message: 'password updated successfully' };
//   }

//   @Public()
//   @Post('forgot-password')
//   async forgotPassword(
//     @Body() dto: ForgotPasswordDto,
//   ): Promise<{ message: string }> {
//     await this.passwordService.forgotPassword(dto);
//     return { message: 'Password reset link sent to your email.' };
//   }

//   @Public()
//   @Post('reset-password/:resetToken')
//   async resetPassword(
//     @Body() dto: ResetPasswordDto,
//     @Param('resetToken') resetToken: string,
//   ): Promise<{ message: string }> {
//     await this.passwordService.resetPassword(dto, resetToken);
//     return { message: 'Password reset successfully' };
//   }
// }
