import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { IsUsername } from '../../common/decorators/is-username.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'mateo' })
  @IsUsername()
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