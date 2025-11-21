import { CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export const HOUSE_TYPES = ['for sale', 'for rent'] as const;
export type HouseType = (typeof HOUSE_TYPES)[number];

export const PROPERTY_TYPES = ['condo', 'house', 'land'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

@Entity('houses')
export class House {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  type: HouseType; // which is rental or for sale

  @Column()
  secure_url: string;

  @Column()
  location: string;

  @Column({ type: 'decimal', nullable: true })
  previousPrice: number | null;

  @Column({ type: 'decimal' })
  price: number; // or currentPrice if you prefer

  @Column({ default: false })
  priceReduced: boolean;

  @Column()
  bedroom: number;

  @Column()
  bathroom: number;

  @Column()
  area: string;

  @Column()
  property_type: PropertyType;

  @OneToMany(() => Bookmark, (bookmark) => bookmark.house)
  bookmarks: Bookmark[];

  @OneToMany(() => Notification, (notification) => notification.house)
  notifications: Notification[];

  @ManyToOne(() => User, (user) => user.houses, { nullable: false })
  user!: Relation<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => House, (house) => house.bookmarks, { onDelete: 'CASCADE' })
  house: House;

  @ManyToOne(() => User, (user) => user.bookmarks, { nullable: false })
  user: Relation<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  type: string;

  @ManyToOne(() => House, (house) => house.notifications, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  house: Relation<House>;

  @ManyToOne(() => User, (user) => user.notifications, { nullable: false })
  user: Relation<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
