import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsLinkUrl } from '../../common/decorators/is-link-url.decorator';

export class CreateLinkDto {
  @ApiProperty({ example: 'Mi Portfolio' })
  @IsString()
  @IsNotEmpty({ message: 'El titulo es obligatorio' })
  @MaxLength(120, { message: 'El titulo no puede superar los 120 caracteres' })
  title: string;

  @ApiProperty({ example: 'https://ejemplo.com' })
  @IsLinkUrl({ message: 'La URL debe ser http://, https://, mailto: o tel: valida' })
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ example: 'globe' })
  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'El icono no puede superar los 60 caracteres' })
  icon?: string;
}