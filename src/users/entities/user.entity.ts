import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Bookmark } from 'src/bookmarks/bookmarks.entity';
import { UserSession } from './user-session.entity';
import { PasswordReset } from './password-reset.entity';
import { UserProfile } from './user-profile.entity';
import { UserRole } from './user-roles.entity';

export type UserStatus = 'active' | 'blocked' | 'deleted' | 'pending';

// @Unique(['email'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  email: string;

  @Column({ type: 'text', nullable: true })
  hashedPassword?: string | null;

  @Column({ type: 'boolean', nullable: false, default: false })
  isVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  hashedOTP?: string | null;

  @Column({ type: 'varchar', nullable: true })
  provider?: string | null;

  @Column({ type: 'varchar', nullable: true })
  providerId?: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'blocked', 'deleted', 'pending'],
    default: 'active',
  })
  status: UserStatus;

  // Relations
  @OneToMany(() => UserSession, (session) => session.user)
  sessions: Relation<UserSession[]>;

  @OneToMany(() => PasswordReset, (reset) => reset.user)
  passwordResets: Relation<PasswordReset[]>;

  @OneToOne(() => UserProfile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  profile?: Relation<UserProfile> | null;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user, { eager: true })
  bookmarks: Relation<Bookmark[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
