// import { randomInt } from 'crypto';
// import {
//   Injectable,
//   BadRequestException,
//   UnauthorizedException,
//   ConflictException,
// } from '@nestjs/common';
// import { UsersService } from 'src/users/users.service';
// import { MailService } from 'src/mail/mail.module';

// @Injectable()
// export class AuthService {
//   constructor(
//     private readonly usersService: UsersService,
//     private readonly mailService: MailService,
//     private readonly sessionService: ,
//     private readonly tokenService: TokenService,
//   ) {}

//   async signup(dto: SignupDto): Promise<{ message: string }> {
//     const { email, password } = dto;
//     const existing = await this.usersService.findByEmail(email);

//     if (existing) throw new ConflictException('Email already exists');

//     const verifytoken = String(randomInt(100000, 999999));

//     await this.usersService.createUser(email, password, verifytoken);

//     await this.mailService.sendVerifyCode(email, verifytoken);

//     return { message: 'verification code has been sent to your email' };
//   }

//   async verifyEmail(otp: string): Promise<AuthInternal> {
//     console.log('verication code is: ', otp);
//     const user = await this.usersService.findByOTP(otp);
//     if (!user) throw new BadRequestException('User not found');

//     const isMatch = await compare(otp, user.hashedOTP!);

//     console.log('isMatch is ', isMatch);

//     if (!isMatch) throw new UnauthorizedException('Invalid verification token');

//     await this.usersService.updateUser(user.id, {
//       isVerified: true,
//       status: 'active',
//       hashedOTP: null,
//     });

//     const accessToken = await this.tokenService.getAccessToken(user);
//     const refreshToken = await this.tokenService.getRefreshToken();

//     await this.sessionService.createSession(user.id, refreshToken);

//     return {
//       message: 'signed up successfully',
//       email: user.email,
//       accessToken,
//       refreshToken,
//     };
//   }

//   async signin(dto: SigninDto): Promise<AuthInternal> {
//     const user = await this.usersService.findByEmail(dto.email);

//     if (!user) throw new UnauthorizedException('User not found');

//     const isMatch = await compare(dto.password, user.hashedPassword!);

//     if (!isMatch) throw new BadRequestException('Incorrect password');

//     const accessToken = await this.tokenService.getAccessToken(user);
//     const refreshToken = await this.tokenService.getRefreshToken();

//     return {
//       message: 'signed in successfully',
//       email: user.email,
//       accessToken,
//       refreshToken,
//     };
//   }
// }
