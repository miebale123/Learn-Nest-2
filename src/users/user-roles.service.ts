import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './entities/user-roles.entity';
import { Broker } from 'src/broker/broker.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UserRolesService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,

    @InjectRepository(Broker)
    private readonly brokerRepo: Repository<Broker>,
  ) {}

  async assignRoleToUser(
    user: User,
    roleId: number,
    companyName?: string,
    location?: string,
  ) {
    const userRole = this.userRoleRepo.create({
      user: { id: user.id },
      role: { id: roleId },
    });

    const broker = this.brokerRepo.create({
      fullName: user.profile?.full_name || user.email,
      companyName, 
      location,
      user: user, 
    });
    await this.brokerRepo.save(broker);

    return await this.userRoleRepo.save(userRole);
  }
}
