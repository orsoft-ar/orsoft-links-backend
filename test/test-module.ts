import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { JwtAuthGuard } from '../src/common/guards/jwt-auth.guard';
import { LinkPagesModule } from '../src/link-pages/link-pages.module';
import { LinksModule } from '../src/links/links.module';
import { PublicModule } from '../src/public/public.module';
import { UsersModule } from '../src/users/users.module';

export const testImports = [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRoot({
    type: 'better-sqlite3',
    database: ':memory:',
    autoLoadEntities: true,
    synchronize: true,
    dropSchema: true,
  }),
  UsersModule,
  AuthModule,
  LinkPagesModule,
  LinksModule,
  PublicModule,
];

export const testProviders = [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
  { provide: APP_FILTER, useClass: HttpExceptionFilter },
];

export const globalValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
});