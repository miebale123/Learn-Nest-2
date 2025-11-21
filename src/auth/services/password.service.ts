import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from '../dto/auth-credentials.dto';
import { User } from 'src/users/entities/user.entity';
import { PasswordResetService } from 'src/users/password-reset.service';
import { compare, hash } from '../bcrypt.util';
import { MailService } from 'src/mail/mail.module';

@Injectable()
export class PasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  // --- Update user password ---
  async updatePassword(user: User, dto: UpdatePasswordDto): Promise<void> {
    const { oldPassword, newPassword } = dto;

    if (!user.hashedPassword)
      throw new BadRequestException('No password set for user');

    const isMatch = await compare(oldPassword, user.hashedPassword);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    if (oldPassword === newPassword)
      throw new ConflictException('Old and new password cannot be the same');

    const hashedPassword = await hash(newPassword);
    await this.usersService.updateUser(user.id, { hashedPassword });
  }

  // --- Forgot password ---
  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const { email } = dto;

    if (typeof email !== 'string')
      throw new BadRequestException('Email is required');

    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Use PasswordResetService to create token
    const resetToken = await this.passwordResetService.createVerification(
      user.id,
    );

    // Send email with raw token
    await this.mailService.sendPasswordReset(user.email, resetToken);
  }

  // --- Reset password using token ---
  async resetPassword(dto: ResetPasswordDto, resetToken: string) {
    const { newPassword } = dto;

    // Validate token and get user
    const user = await this.passwordResetService.verifyUserToken(resetToken);
    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await hash(newPassword);
    await this.usersService.updateUser(user.id, { hashedPassword });

    return { message: 'Password reset successful' };
  }
}
