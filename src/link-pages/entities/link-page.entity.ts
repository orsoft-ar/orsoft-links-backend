import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Link } from '../../links/entities/link.entity';
import { User } from '../../users/entities/user.entity';

@Entity('link_pages')
export class LinkPage {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'userId' })
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ example: 'mateo' })
  @Index('UQ_link_pages_username', { unique: true })
  @Column({ length: 30, unique: true })
  username: string;

  @ApiProperty({ example: 'Mateo Gerbaudo' })
  @Column({ length: 120, default: '' })
  title: string;

  @ApiProperty({ example: 'Desarrollador Full Stack', nullable: true })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'https://ejemplo.com/perfil.png', nullable: true })
  @Column({ length: 500, nullable: true })
  profileImageUrl: string | null;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @OneToMany(() => Link, (link) => link.linkPage, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  links: Link[];

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
