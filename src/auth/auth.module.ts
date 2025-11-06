import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { APP_GUARD } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { configuration } from '../config/app.config';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MailModule } from 'src/mail/mail.module';
import { MailService } from 'src/mail/mail.service';
import { UsersService } from 'src/users/users.service';
import { GoogleStrategy, JwtStrategy } from './strategies';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { SessionsService } from './services/session.service';
import { PasswordReset } from 'src/users/entities/password-reset.entity';
import { PasswordResetService } from 'src/users/password-reset.service';
import { UserSession } from 'src/users/entities/user-session.entity';
import { PasswordService } from './services/password.service';
import { TokenService } from './services/token.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forFeature([User, UserSession, PasswordReset]),
    JwtModule.registerAsync({
      inject: [configuration.KEY],
      useFactory: (config: ConfigType<typeof configuration>) => ({
        secret: config.jwt_secret,
        signOptions: { expiresIn: config.jwt_expiry },
      }),
    }),
    UsersModule,
    MailModule,
  ],

  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    MailService,
    UsersService,
    SessionsService,
    PasswordResetService,
    TokenService,
  ],
  exports: [PassportModule],
})
export class AuthModule {}
