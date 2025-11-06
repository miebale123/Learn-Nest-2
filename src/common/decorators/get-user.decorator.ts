import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { User } from '../../users/entities/user.entity';
import type { RequestWithUserAndCookies } from '../../auth/interfaces/req-user-cookies.interface';

export const GetUser = createParamDecorator(
(_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<RequestWithUserAndCookies>();
  return request.user;
},
);
