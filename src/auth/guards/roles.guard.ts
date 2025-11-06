// src/auth/roles.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.getAllAndOverride<string[]>(
//       ROLES_KEY,
//       [context.getHandler(), context.getClass()],
//     );

//     if (!requiredRoles || requiredRoles.length === 0) return true;

//     const request = context
//       .switchToHttp()
//       .getRequest<{ user?: { roles?: string[] } }>();
//     const userRoles = request.user?.roles || [];

//     if (!userRoles.length) return false;
//     return requiredRoles.some((r) => userRoles.includes(r));
//   }
// }

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles?.length) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: { roles?: string[] } }>();

    console.log('request are: ', request);
    const userRoles = request.user?.roles || [];

    console.log('user role in roles guard are: ', userRoles);

    if (!userRoles.length) return false;

    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
