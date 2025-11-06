// src/audit/audit-log.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  userId: string; // store user id or "guest"

  @Column({ type: 'varchar', nullable: false })
  action: string; // e.g. "POST /auth/sign-in"

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // request body, etc.

  @Column({ type: 'varchar', nullable: true })
  ip?: string;

  @Column({ type: 'varchar', nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
