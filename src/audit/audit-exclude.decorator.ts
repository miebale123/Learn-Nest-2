// src/audit/decorators/audit-exclude.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AUDIT_EXCLUDE_KEY = 'auditExclude';
export const AuditExclude = () => SetMetadata(AUDIT_EXCLUDE_KEY, true);
