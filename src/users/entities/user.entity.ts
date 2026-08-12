import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'mateo' })
  @Index('UQ_users_username', { unique: true })
  @Column({ length: 30, unique: true })
  username: string;

  @ApiProperty({ example: 'mateo@orsoft.site' })
  @Index('UQ_users_email', { unique: true })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: false })
  @Column({ type: 'boolean', default: true })
  enabled: boolean;

  @Column({ select: false })
  password: string;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
