import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RolesService } from 'src/users/roles.service';
import { UserRolesService } from 'src/users/user-roles.service';
import { compare, hash } from 'src/auth/bcrypt.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly roleService: RolesService,
    private readonly userRolesService: UserRolesService,
  ) {}

  async getUsers() {
    return this.userRepo.find({ relations: ['userRoles', 'userRoles.role'] });
  }

  async createAdmin(email: string, password: string) {
    const hashedPassword = await hash(password);
    const user = this.userRepo.create({
      email,
      hashedPassword,
      status: 'active',
      isVerified: true,
    });

    await this.userRepo.save(user);

    let adminRole = await this.roleService.findRole('admin');
    if (!adminRole) {
      adminRole = await this.roleService.createRole('admin');
    }

    await this.userRolesService.assignRoleToUser(user.id, adminRole.id);
  }

  async createUser(
    email: string,
    password?: string | null,
    verifytoken?: string | null,
  ): Promise<User> {
    const hashedPassword = password ? await hash(password) : null;
    console.log('hashedPassword is ', hashedPassword);

    const hashedOTP = verifytoken ? await hash(verifytoken) : null;

    // 2. Create user
    const user = this.userRepo.create({
      email,
      status: 'pending',
      hashedPassword,
      hashedOTP,
    });

    let role = await this.roleService.findRole('user');

    if (!role) {
      role = await this.roleService.createRole('user');
    }
    try {
      const savedUser = await this.userRepo.save(user);
      await this.userRolesService.assignRoleToUser(user.id, role.id);
      return savedUser;
      // 3. Save
    } catch (err) {
      if (err.code === '23505') {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException(
        'Failed to create user, please try again',
      );
    }
  }

  async findById(id: number) {
    return await this.userRepo.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'], // load roles through UserRole
    });
  }

  async findByEmail(email: string) {
    const the_user_is = await this.userRepo.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role'],
    });

    console.log('the_user_is', the_user_is);

    const fullUser = await this.userRepo.findOne({
      where: { email: 'admin@gmail.com' },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!fullUser) return null;

    console.log(
      'Admin roles are:',
      fullUser.userRoles.map((r) => r.role.name),
    );
    return the_user_is;
  }

  async updateUser(id: number, data: Partial<User>): Promise<void> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.update(id, data);
  }

  async findByOTP(OTP: string): Promise<User | null> {
    const users = await this.userRepo.find();
    for (const user of users) {
      if (user.hashedOTP) {
        const isMatch = await compare(OTP, user.hashedOTP);
        console.log('isMatch for user ', user.email, ' is ', isMatch);
        if (isMatch) {
          return user;
        }
      }
    }
    return null;
  }
}
