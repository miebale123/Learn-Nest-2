import { Controller, Get, Query } from '@nestjs/common';
import { AuditQueryService } from './audit-query.service';


@Controller('audit')
export class AuditController {
    constructor(private readonly auditQuery: AuditQueryService) { }

    @Get('all')
    getAll() {
        return this.auditQuery.getAllLogs();
    }

    @Get('by-ip')
    getByIp(@Query('ip') ip: string) {
        return this.auditQuery.getLogsByIp(ip);
    }

    @Get('by-user')
    getByUser(@Query('userId') userId: string) {
        return this.auditQuery.getLogsByUser(userId);
    }

    @Get('by-action')
    getByAction(@Query('action') action: string) {
        return this.auditQuery.getLogsByAction(action);
    }
}
