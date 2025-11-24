import {
  Module,
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  Patch,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Bookmark,
  House,
  HouseType,
  Notification,
  PropertyType,
} from './houses.entity';
import { GetUser, Public } from 'src/common';
import { User } from 'src/users/entities/user.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MailService } from 'src/mail/mail.module';
import { MailModule } from 'src/mail/mail.module';
import { Readable } from 'stream';
import { FileInterceptor } from '@nestjs/platform-express';

export class HouseDto {
  type: HouseType;
  property_type: PropertyType;
  secure_url: string;
  location: string;
  previousPrice?: number;
  priceReduced?: boolean;
  price: number;
  bathroom: number;
  bedroom: number;
  area: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Set<number>();

  handleConnection(socket: any) {
    const userId = Number(socket.handshake.query.userId);
    if (userId) {
      socket.join(String(userId));
      this.onlineUsers.add(userId);
    }
  }

  handleDisconnect(socket: any) {
    const userId = Number(socket.handshake.query.userId);
    if (userId) {
      this.onlineUsers.delete(userId);
    }
  }

  isUserOnline(userId: number) {
    return this.onlineUsers.has(userId);
  }

  sendToUser(userId: number, payload: any) {
    this.server.to(String(userId)).emit('notification', payload);
  }

  sendToAll(payload: any) {
    this.server.emit('notification', payload);
  }
}

@Controller('houses')
export class HousesController {
  constructor(
    @InjectRepository(House)
    private houseRepository: Repository<House>,

    private notificationGateway: NotificationGateway,

    @InjectRepository(Bookmark)
    private bookmarkRepo: Repository<Bookmark>,

    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,

    private mailService: MailService,
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });
  }

  @Post('upload-house')
  @UseInterceptors(FileInterceptor('file'))
  async uploadHouse(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: HouseDto,
    @GetUser() user: User,
  ) {
    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto' },
        (error: UploadApiErrorResponse, result: UploadApiResponse) => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          if (error) return reject(error);
          resolve(result);
        },
      );
      Readable.from(file.buffer).pipe(upload);
    });

    const newHouse = this.houseRepository.create({
      type: dto.type,
      property_type: dto.property_type,
      secure_url: result.secure_url,
      location: dto.location,
      price: dto.price,

      // new fields handled correctly
      previousPrice: null,
      priceReduced: false,

      bedroom: dto.bedroom,
      bathroom: dto.bathroom,
      area: dto.area,
      user,
    });

    const saved = await this.houseRepository.save(newHouse);

    return {
      savedHouse: {
        ...saved,
        userId: saved.user.id,
      },
    };
  }

  @Get('bookmarks')
  async getBookmarks(@GetUser() user: User) {
    return this.bookmarkRepo.find({
      where: { user: { id: user.id } },
      relations: ['house'],
    });
  }

  @Get('notifications')
  async getNotifications(@GetUser() user: User) {
    return this.notificationRepo.find({
      where: { user: { id: user.id } },
      relations: ['house', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  @Public()
  @Get()
  async getHouses(
    @Query('min') min?: string,
    @Query('max') max?: string,
    @Query('bedroom') bedroom?: string,
    @Query('bathroom') bathroom?: string,
    @Query('property_type') property_type?: string,
    @Query('type') type?: string,
    @Query('location') location?: string,
  ) {
    const qb = this.houseRepository
      .createQueryBuilder('house')
      .leftJoinAndSelect('house.user', 'user')
      .orderBy('house.created_at', 'ASC');

    if (min) qb.andWhere('house.price >= :min', { min });
    if (max) qb.andWhere('house.price <= :max', { max });
    if (bedroom) qb.andWhere('house.bedroom = :bedroom', { bedroom });
    if (bathroom) qb.andWhere('house.bathroom = :bathroom', { bathroom });
    if (property_type)
      qb.andWhere('house.property_type = :property_type', { property_type });
    if (type) qb.andWhere('house.type = :type', { type });

    if (location) {
      qb.andWhere('LOWER(house.location) LIKE LOWER(:loc)', {
        loc: `%${location}%`,
      });
    }

    const houses = await qb.getMany();

    return houses.map((h) => ({
      id: h.id,
      type: h.type,
      property_type: h.property_type,
      secure_url: h.secure_url,
      location: h.location,
      price: h.price,
      previousPrice: h.previousPrice,
      priceReduced: h.priceReduced,
      bedroom: h.bedroom,
      bathroom: h.bathroom,
      area: h.area,
      userId: h.user.id,
    }));
  }

  @Get(':id')
  async getHouse(@Param('id') id: string) {
    const house = await this.houseRepository.findOneBy({ id });

    if (!house) throw new NotFoundException('House not found');
    return house;
  }

  @Patch(':id')
  async updateHouse(
    @Param('id') id: string,
    @Body() dto: HouseDto,
    @GetUser() user: User,
  ) {
    const existing = await this.houseRepository.findOne({
      where: { id, user: { id: user.id } as any },
      relations: ['user'],
    });

    if (!existing) throw new NotFoundException('House not found');

    // Save previous price for comparison
    const prevPrice = existing.price;

    // Update fields if provided
    if (dto.location !== undefined) existing.location = dto.location;
    if (dto.price !== undefined) existing.price = dto.price;
    if (dto.bedroom !== undefined) existing.bedroom = dto.bedroom;
    if (dto.bathroom !== undefined) existing.bathroom = dto.bathroom;
    if (dto.area !== undefined) existing.area = dto.area;

    // Compute price reduction
    existing.previousPrice = prevPrice;
    existing.priceReduced = existing.price < prevPrice;

    const updatedHouse = await this.houseRepository.save(existing);

    // Notify users who bookmarked
    const saversOfHouse = await this.bookmarkRepo.find({
      where: { house: { id: existing.id } },
      relations: ['user', 'house'],
    });

    for (const bookmark of saversOfHouse) {
      const payload = {
        type: 'price-drops: ',
        houseId: updatedHouse.id,
      };

      const notification = this.notificationRepo.create({
        ...payload,
        user: bookmark.user,
        house: bookmark.house,
      });
      await this.notificationRepo.save(notification);

      this.notificationGateway.sendToUser(bookmark.user.id, payload);

      if (!this.notificationGateway.isUserOnline(bookmark.user.id)) {
        try {
          await this.mailService.sendHouseUpdated(
            bookmark.user.email,
            bookmark.house,
          );
        } catch (err) {
          console.error('Failed to send email', err);
        }
      }
    }

    return {
      updatedHouse: {
        id: updatedHouse.id,
        type: updatedHouse.type,
        property_type: updatedHouse.property_type,
        secure_url: updatedHouse.secure_url,
        location: updatedHouse.location,
        price: updatedHouse.price,
        previousPrice: updatedHouse.previousPrice,
        priceReduced: updatedHouse.priceReduced,
        bedroom: updatedHouse.bedroom,
        bathroom: updatedHouse.bathroom,
        area: updatedHouse.area,
        userId: updatedHouse.user.id,
      },
    };
  }

  @Delete('deleteHouse/:id')
  async deleteHouse(@Param('id') id: string) {
    const existing = await this.houseRepository.findOneBy({ id });
    if (!existing) throw new NotFoundException('House not found');

    return this.houseRepository.delete(id);
  }

  @Delete('deleteNotification/:id')
  async deleteNotification(@Param('id') id: string, @GetUser() user: User) {
    const existing = await this.notificationRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user'],
    });

    const result = await this.notificationRepo.delete(id);
    return { result };
  }
  @Delete('deleteBookmark/:id')
  async deleteBookmark(@Param('id') id: string, @GetUser() user: User) {
    const existing = await this.bookmarkRepo.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user'],
    });

    const result = await this.bookmarkRepo.delete(id);
    return { result };
  }

  @Post('create-bookmark')
  async createBookmark(
    @Body('houseId') houseId: string,
    @GetUser() user: User,
  ) {
    const house = await this.houseRepository.findOneBy({ id: houseId });

    if (!house) throw new NotFoundException('House not found');

    const newBookmark = this.bookmarkRepo.create({
      user,
      house,
    });

    const savedBookmark = await this.bookmarkRepo.save(newBookmark);

    return { message: 'Bookmarked', savedBookmark };
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([House, Bookmark, Notification]),
    MailModule,
  ],
  controllers: [HousesController],
  providers: [NotificationGateway],
})
export class HousesModule {}
