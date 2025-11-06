import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';
import { AUDIT_EXCLUDE_KEY } from './audit-exclude.decorator';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private readonly auditService: AuditService,
        private readonly reflector: Reflector,
        private readonly logger: PinoLogger,
    ) {
        this.logger.setContext(AuditInterceptor.name);
    }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const isExcluded = this.reflector.getAllAndOverride<boolean>(
            AUDIT_EXCLUDE_KEY,
            [context.getHandler(), context.getClass()],
        );

        const req = context.switchToHttp().getRequest<{
            user?: { id: string };
            method: string;
            url: string;
            body: Record<string, any>;
            ip: string;
            headers: Record<string, string>;
        }>();

        const { method, url, body, ip, headers } = req;
        if (method === 'OPTIONS') return next.handle();

        const user = req.user;
        const userAgent = headers['user-agent'];
        const start = Date.now();

        const sanitizedBody = { ...body };
        if ('password' in sanitizedBody) sanitizedBody.password = '[REDACTED]';

        if (isExcluded) return next.handle();

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - start;

                this.auditService
                    .log(user?.id ?? 'guest', `${method} ${url}`, { body: sanitizedBody }, ip, userAgent)
                    .catch((err) => this.logger.error({ err }, 'Failed to log audit'));

                this.logger.debug({
                    userId: user?.id ?? 'guest',
                    method,
                    url,
                    ip,
                    userAgent,
                    duration,
                }, '[AUDIT]');
            }),
        );
    }
}
