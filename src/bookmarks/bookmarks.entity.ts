import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('bookmarks')
export class Bookmark {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  price: string;

  @Column()
  secure_url: string;

  @Column()
  location: string;

  @ManyToOne(() => User, (user) => user.bookmarks, {nullable: false})
  user: User;
}
