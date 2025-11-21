import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AdminSeederService {
  constructor(private readonly userService: UsersService) {}

  async createDefaultAdmin() {
    const email = 'admin@gmail.com';
    // Check if admin user exists; if not, create it
    const existingAdmin = await this.userService.findByEmail(email);

    if (!existingAdmin) {
      const password = 'secure';
      console.log('the admin password is: ', password);
      const admin = this.userService.createAdmin(email, password);
    }
  }
}
