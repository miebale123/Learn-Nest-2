import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/users/entities/roles.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findRole(roleName: string): Promise<Role | null> {
    return this.roleRepo.findOne({ where: { name: roleName } });
  }

  async createRole(roleName: string): Promise<Role> {
    const role = this.roleRepo.create({
      name: roleName,
      description: `${roleName} role`,
    });
    return this.roleRepo.save(role);
  }
}
