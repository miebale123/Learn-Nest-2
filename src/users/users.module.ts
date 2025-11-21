import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { HousesModule } from 'src/houses/houses.module';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { RolesService } from 'src/users/roles.service';
import { Role } from './entities/roles.entity';
import { UserSession } from './entities/user-session.entity';
import { SessionsService } from 'src/auth/services/session.service';
import { PasswordResetService } from './password-reset.service';
import { PasswordReset } from './entities/password-reset.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserRolesService } from 'src/users/user-roles.service';
import { UserRole } from './entities/user-roles.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserProfile,
      Role,
      UserRole,
      UserSession,
      PasswordReset,
    ]),
    forwardRef(() => HousesModule),
    // forwardRef(() => BookmarkModule),
  ],
  providers: [
    UsersService,
    RolesService,
    UserRolesService,
    SessionsService,
    PasswordResetService,
  ],
  exports: [
    UsersService,
    RolesService,
    UserRolesService,
    SessionsService,
    PasswordResetService,
  ],
  controllers: [UsersController],
})
export class UsersModule {}
