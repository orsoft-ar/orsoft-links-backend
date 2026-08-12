import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkPage } from '../link-pages/entities/link-page.entity';
import { Link } from './entities/link.entity';
import { LinksService } from './links.service';

@Module({
  imports: [TypeOrmModule.forFeature([Link, LinkPage])],
  providers: [LinksService],
  exports: [LinksService],
})
export class LinksModule {}