import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('houses')
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  secure_url: string;

  @Column()
  location: string;

  @Column()
  price: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
