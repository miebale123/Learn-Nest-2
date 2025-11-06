import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable } from 'rxjs';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { AuthInternal } from '../interfaces/AuthInternal.interface';

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      map((data: AuthInternal): AuthResponseDto => {
        response.cookie('refresh-token', data.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        console.log(data.refreshToken);

        delete data?.refreshToken;

        const { email, accessToken, message } = data;

        return { email, accessToken, message };
      }),
    );
  }
}
