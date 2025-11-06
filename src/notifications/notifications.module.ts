import { Module } from '@nestjs/common';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notification.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly gateway: NotificationsGateway) {}

  send(message: string) {
    this.gateway.sendNotification(message);
  }
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  sendNotification(@Body() body: { message: string }) {
    this.notificationsService.send(body.message);
    return { status: 'sent', message: body.message };
  }

  @Get()
  getStatus() {
    return { status: 'Notification system active' };
  }
}

@Module({
  providers: [NotificationsGateway, NotificationsService],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
