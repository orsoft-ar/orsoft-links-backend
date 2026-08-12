import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUrl, Length, Matches, MaxLength } from 'class-validator';
import { normalizeUsername } from '../../common/utils/username.utils';
import { TrimmedUrl } from './create-link-page.dto';

export class UpdateLinkPageDto {
  @ApiPropertyOptional({ example: 'mateo' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? normalizeUsername(value) : value))
  @IsString()
  @Length(3, 30, { message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' })
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'El nombre de usuario solo puede contener letras, numeros, _ y -',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'Mateo Gerbaudo' })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El titulo no puede superar los 120 caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'Desarrollador Full Stack' })
  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'La descripcion no puede superar los 300 caracteres' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://ejemplo.com/perfil.png' })
  @IsOptional()
  @IsString()
  @TrimmedUrl()
  @IsUrl(
    { require_protocol: true, protocols: ['http', 'https'] },
    { message: 'La URL de imagen debe ser http:// o https://' },
  )
  @MaxLength(500)
  profileImageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}