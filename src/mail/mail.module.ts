import {
  Injectable,
  InternalServerErrorException,
  Module,
} from '@nestjs/common';
import { CreateEmailOptions, Resend } from 'resend';

@Injectable()
export class MailService {
  private resend = new Resend(process.env.EMAIL_FROM);

  private async send(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }) {
    try {
      const payload: any = {
        from: 'miebalen@gmail.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      return await this.resend.emails.send(payload);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Email failed to send');
    }
  }

  async sendVerifyCode(email: string, token: string) {
    return this.send({
      to: email,
      subject: 'Verify your email',
      html: `<p>Hello,</p><p>Your code is <strong>${token}</strong></p>`,
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    return this.send({
      to: email,
      subject: 'Password Reset Request',
      text: `Reset your password:\nhttp://localhost:4200/auth/reset-password/${resetToken}`,
    });
  }

  async sendHouseUpdated(email: string, house: {location: string}) {
    return this.send({
      to: email,
      subject: 'A House You Saved Has Been Updated',
      html: `<div>${house.location}</div>`,
    });
  }
}

@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
