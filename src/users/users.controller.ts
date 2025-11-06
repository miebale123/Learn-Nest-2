import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Public } from 'src/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id') id: string): Promise<User | null> {
    return await this.usersService.findByEmail(id);
  }

  
  @Public()
  @Get()
  async getUsers() {
    return await this.usersService.getAllUsers();
  }
}
