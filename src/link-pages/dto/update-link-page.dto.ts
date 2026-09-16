import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { IsUsername } from '../../common/decorators/is-username.decorator';
import { TrimmedUrl } from './create-link-page.dto';

export class UpdateLinkPageDto {
  @ApiPropertyOptional({ example: 'mateo' })
  @IsUsername(true)
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