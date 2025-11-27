import { Body, Controller, Module, Patch } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from './users/entities/user-profile.entity';
import { Repository } from 'typeorm';
import { GetUser, Public } from './common';
import { User } from './users/entities/user.entity';

@Controller('user_profile')
class SettingsController {
  constructor(
    @InjectRepository(UserProfile)
    private userProfile: Repository<UserProfile>,
  ) {}

  @Patch('location')
  async updateUserProfile(
    @GetUser() user: User,
    @Body('location') location: string,
  ) {
    let profile = await this.userProfile.findOne({
      where: { user: { id: user.id } },
    });

    if (!profile) {
      profile = this.userProfile.create({ user, location });
    } else {
      profile.location = location;
    }

    const savedProfile = await this.userProfile.save(profile);

    return {
      message: 'Profile updated successfully',
      brokerLocation: savedProfile.location,
    };
  }
}

@Module({
  controllers: [SettingsController],
  imports: [TypeOrmModule.forFeature([UserProfile])],
})
export class SettingsModule {}
