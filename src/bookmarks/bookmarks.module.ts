import {
  Controller,
  Post,
  Body,
  Module,
  Get,
  Param,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Bookmark } from './bookmarks.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { House } from 'src/houses/houses.entity';
import { UsersModule } from 'src/users/users.module';
import { HousesModule } from 'src/houses/houses.module';
import { GetUser } from 'src/common';

class CreateBookmarkDto {
  secure_url: string;
  price: string;
  location: string;
}

@Controller('bookmarks')
class BookmarkController {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    private readonly usersService: UsersService,
  ) {}

  @Post('create-bookmark')
  async createBookmark(@Body() dto: CreateBookmarkDto, @GetUser() user: User) {
    const userFound = await this.usersService.findById(user.id);

    console.log('User found:', userFound);
    if (!userFound) return;

    const existingBookmark = await this.bookmarkRepository.findOne({
      where: {
        secure_url: dto.secure_url,
        user: { id: user.id },
      },
    });

    if (existingBookmark) {
      return;
    }
    const newBookmark = this.bookmarkRepository.create({
      price: dto.price,
      location: dto.location,
      secure_url: dto.secure_url,
      user: user,
    });

    return await this.bookmarkRepository.save(newBookmark);
  }

  @Get()
  async getAllBookmarks(@GetUser() user: User) {
    return this.bookmarkRepository.find({ where: { user: { id: user.id } } });
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookmark, User, House]),
    forwardRef(() => UsersModule),
    HousesModule,
  ],
  controllers: [BookmarkController],
  providers: [UsersService],
})
export class BookmarkModule {}
