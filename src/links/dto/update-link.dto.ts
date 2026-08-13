import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { IsLinkUrl } from '../../common/decorators/is-link-url.decorator';

export class UpdateLinkDto {
  @ApiPropertyOptional({ example: 'Mi Nuevo Portfolio' })
  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El titulo no puede superar los 120 caracteres' })
  title?: string;

  @ApiPropertyOptional({ example: 'https://ejemplo.com/nuevo' })
  @IsOptional()
  @IsLinkUrl({ message: 'La URL debe ser http://, https://, mailto: o tel: valida' })
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({ example: 'github' })
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'El icono no puede superar los 60 caracteres' })
  icon?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  position?: number;
}