import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;

  // when new notification event happens (like a new property)
  sendNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  // optional: listen to client messages
  @SubscribeMessage('messageFromClient')
  handleMessage(@MessageBody() data: string) {
    console.log('Client sent:', data);
  }
}
