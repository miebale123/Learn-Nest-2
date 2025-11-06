import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { AuthModule } from 'src/auth';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [MailService],
  exports: [MailService], // export so Auth can use it
})
export class MailModule {}
