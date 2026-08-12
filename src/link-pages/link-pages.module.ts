import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkPagesController } from './link-pages.controller';
import { LinkPagesService } from './link-pages.service';
import { LinkPage } from './entities/link-page.entity';
import { UsersModule } from '../users/users.module';
import { LinksModule } from '../links/links.module';

@Module({
  imports: [TypeOrmModule.forFeature([LinkPage]), UsersModule, LinksModule],
  controllers: [LinkPagesController],
  providers: [LinkPagesService],
  exports: [LinkPagesService],
})
export class LinkPagesModule {}