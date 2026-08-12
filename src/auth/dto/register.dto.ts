import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { normalizeUsername } from '../../common/utils/username.utils';

export class RegisterDto {
  @ApiProperty({ example: 'mateo' })
  @Transform(({ value }) => (typeof value === 'string' ? normalizeUsername(value) : value))
  @IsString()
  @IsNotEmpty()
  @Length(3, 30, { message: 'El nombre de usuario debe tener entre 3 y 30 caracteres' })
  @Matches(/^[a-z0-9_-]+$/, {
    message: 'El nombre de usuario solo puede contener letras, numeros, _ y -',
  })
  username: string;

  @ApiProperty({ example: 'mateo@orsoft.site' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Ingrese un email valido' })
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 72, { message: 'La contrasena debe tener entre 6 y 72 caracteres' })
  password: string;
}