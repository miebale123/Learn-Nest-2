import { House } from 'src/houses/houses.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export type BrokerStatus = 'active' | 'blocked' | 'deleted' | 'pending';

@Entity('brokers')
export class Broker {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' }) // adds userId column
  user: User;

  @Column()
  fullName: string;
  @Column({
    type: 'enum',
    enum: ['active', 'blocked', 'deleted', 'pending'],
    default: 'active',
  })
  status: BrokerStatus;

  @Column()
  companyName: string;

  @Column({ nullable: true })
  licenseNumber?: string;

  @Column()
  location: string; // the city/area the broker operates in

  @OneToMany(() => House, (house) => house.assignedBroker)
  houses: House[];
}
