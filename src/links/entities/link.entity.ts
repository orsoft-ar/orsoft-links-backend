import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { LinkPage } from '../../link-pages/entities/link-page.entity';

@Entity('links')
export class Link {
  @ApiProperty({ example: 5 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'linkPageId' })
  linkPageId: number;

  @ManyToOne(() => LinkPage, (linkPage) => linkPage.links, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'linkPageId' })
  linkPage: LinkPage;

  @ApiProperty({ example: 'Mi Portfolio' })
  @Column({ length: 120 })
  title: string;

  @ApiProperty({ example: 'https://ejemplo.com' })
  @Index('IDX_links_url')
  @Column({ length: 500 })
  url: string;

  @ApiPropertyOptional({ example: 'globe' })
  @Column({ length: 60, default: 'globe' })
  icon: string;

  @ApiProperty({ example: 2 })
  @Index('IDX_links_position')
  @Column({ type: 'int', default: 0 })
  position: number;

  @ApiProperty({ example: true })
  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
