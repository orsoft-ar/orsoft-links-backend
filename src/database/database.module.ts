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
        const base: TypeOrmModuleOptions = {
          type: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        };

        const databaseUrl = configService.get<string>('DATABASE_URL');

        if (databaseUrl) {
          return {
            ...base,
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
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
          ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
        };
      },
    }),
  ],
})
export class DatabaseModule {}