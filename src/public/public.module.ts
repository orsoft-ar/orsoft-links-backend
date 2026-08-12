import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LinkPage } from '../link-pages/entities/link-page.entity';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';

@Module({
  imports: [TypeOrmModule.forFeature([LinkPage])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}