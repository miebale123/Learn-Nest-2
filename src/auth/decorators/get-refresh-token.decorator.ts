import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUserAndCookies } from '../interfaces/req-user-cookies.interface';

export const GetRefreshToken = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest<RequestWithUserAndCookies>();
        return request.cookies?.['refresh-token']; 
    },
);
