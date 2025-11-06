import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/users/entities/user-roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRolesService {
  // This service can be expanded to manage user roles
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  async assignRoleToUser(userId: number, roleId: number) {
    const existing = await this.userRoleRepo.findOne({
      where: { user: { id: userId }, role: { id: roleId } },
    });

    if (!existing) {
      const userRole = this.userRoleRepo.create({
        user: { id: userId },
        role: { id: roleId },
      });
      return await this.userRoleRepo.save(userRole);
    }
  }
}
