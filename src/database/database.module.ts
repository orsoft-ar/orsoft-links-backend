import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import {
  TypeOrmModule,
  type TypeOrmModuleOptions,
} from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        const isTest = configService.get<string>('NODE_ENV') === 'test';
        const base: TypeOrmModuleOptions = {
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: isTest,
          migrationsRun: isProd,
        };

        if (isProd && base.synchronize) {
          throw new Error('DATABASE synchronize must be false in production');
        }

        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            ...base,
            url: databaseUrl,
            ssl: { rejectUnauthorized: true },
          };
        }

        const ssl = configService.get<string>('DB_SSL') === 'true';
        return {
          ...base,
          host: String(configService.get('DB_HOST', 'localhost')),
          port: Number(configService.get('DB_PORT', 5432)),
          username: String(configService.get('DB_USERNAME', 'postgres')),
          password: String(configService.get('DB_PASSWORD', 'postgres')),
          database: String(configService.get('DB_DATABASE', 'orsoft_links')),
          ...(ssl ? { ssl: { rejectUnauthorized: true } } : {}),
        };
      },
    }),
  ],
})
export class DatabaseModule {}