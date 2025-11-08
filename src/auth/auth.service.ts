import { randomInt } from 'crypto';
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthInternal } from './interfaces';
import { UsersService } from '../users/users.service';
import { SigninDto, SignupDto } from './dto/auth-credentials.dto';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/mail/mail.service';
import { SessionsService } from './services/session.service';
import { Profile } from './interfaces';
import { TokenService } from './services/token.service';
import { compare } from './bcrypt.util';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly sessionService: SessionsService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(dto: SignupDto): Promise<{ message: string }> {
    const { email, password } = dto;
    const existing = await this.usersService.findByEmail(email);

    if (existing) throw new ConflictException('Email already exists');

    const verifytoken = String(randomInt(100000, 999999));

    await this.usersService.createUser(email, password, verifytoken);

    await this.mailService.verfiyEmailCode(email, verifytoken);

    return { message: 'verification code has been sent to your email' };
  }

  async verifyEmail(otp: string): Promise<AuthInternal> {
    console.log('verication code is: ', otp);
    const user = await this.usersService.findByOTP(otp);
    if (!user) throw new BadRequestException('User not found');

    const isMatch = await compare(otp, user.hashedOTP!);

    console.log('isMatch is ', isMatch);

    if (!isMatch) throw new UnauthorizedException('Invalid verification token');

    await this.usersService.updateUser(user.id, {
      isVerified: true,
      status: 'active',
      hashedOTP: null,
    });

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken();

    await this.sessionService.createSession(user.id, refreshToken);

    return {
      message: 'signed up successfully',
      email: user.email,
      accessToken,
      refreshToken,
    };
  }

  async signin(dto: SigninDto): Promise<AuthInternal> {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await compare(dto.password, user.hashedPassword!);

    if (!isMatch) throw new BadRequestException('Incorrect password');

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken();

    return {
      message: 'signed in successfully',
      email: user.email,
      accessToken,
      refreshToken,
    };
  }

  async signinWithOAuth(profile: Profile): Promise<AuthInternal> {
    const { email, provider, providerId } = profile.user;

    let user = await this.usersService.findByEmail(email);
    if (!user) user = await this.usersService.createUser(email, null);

    await this.usersService.updateUser(user.id, {
      provider,
      providerId,
      status: 'active',
    });

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken();

    return {
      message: 'signed in successfully',
      email,
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldRefreshToken: string, user: User): Promise<AuthInternal> {
    const foundSession = await this.sessionService.findSession(
      oldRefreshToken,
      user.id,
    );

    if (!foundSession)
      throw new BadRequestException('Refresh token session not found');

    const isMatch = await compare(
      oldRefreshToken,
      foundSession.hashedRefreshToken!,
    );

    if (!isMatch) throw new BadRequestException('Invalid refresh token');

    await this.sessionService.revokeSession(user.id, oldRefreshToken);

    const accessToken = await this.tokenService.generateAccessToken(user);
    const refreshToken = await this.tokenService.generateRefreshToken();

    return {
      message: '',
      email: user.email,
      accessToken,
      refreshToken,
    };
  }

  async logout(user: User, currentRefreshToken: string): Promise<void> {
    await this.sessionService.revokeSession(user.id, currentRefreshToken);
  }
}
