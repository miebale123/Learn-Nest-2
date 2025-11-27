import {
  Controller,
  Body,
  UseGuards,
  Patch,
  Param,
  Get,
  ParseIntPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import { RolesService } from 'src/users/roles.service';
import { UserRolesService } from 'src/users/user-roles.service';

@Controller('admin-page')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly userRolesService: UserRolesService,
  ) {}

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') roleName: string,
  ) {
    // 1. Find the user
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new Error(`user with id ${id} not found`);
    }

    // 2. Find or create role
    let role = await this.rolesService.findRole(roleName);
    if (!role) {
      role = await this.rolesService.createRole(roleName);
    }

    // 3. Update user's role (via pivot table)
    await this.userRolesService.assignRoleToUser(user, role.id);

    return { message: `User ${user.email} role updated to ${role.name}` };
  }

  @Get('users')
  async getAllUsers() {
    return this.usersService.getUsers();
  }
}
