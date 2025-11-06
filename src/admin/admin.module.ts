import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { AdminSeederService } from './admin-seeder.service';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  controllers: [AdminController],
  imports: [UsersModule, TypeOrmModule.forFeature([User])],
  exports: [AdminSeederService],
  providers: [AdminSeederService],
})
export class AdminModule {}
