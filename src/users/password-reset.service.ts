import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordReset } from './entities/password-reset.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { compare, hash } from 'src/auth/bcrypt.util';

@Injectable()
export class PasswordResetService {
  constructor(
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepo: Repository<PasswordReset>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async createVerification(userId: number) {
    const token = crypto.randomUUID();
    const hashedResetToken = await hash(token);
    await this.passwordResetRepo.save({
      userId,
      hashedResetToken,
      expires_at: new Date(Date.now() + 86400000),
    });
    return token;
  }

  async verifyUserToken(token: string): Promise<User | null> {
    const records = await this.passwordResetRepo.find({
      where: { hashedResetToken: Not(IsNull()) },
    });

    for (const record of records) {
      if (await compare(token, record.hashedResetToken)) {
        const user = await this.userRepo.findOneBy({ id: record.userId });
        if (!user) return null;
        user.status = 'active';
        await this.userRepo.save(user);
        await this.passwordResetRepo.delete(record.id);
        return user;
      }
    }
    return null;
  }
}
