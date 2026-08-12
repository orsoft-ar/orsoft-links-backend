import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateLinkStatusDto {
  @ApiProperty({ example: false })
  @IsBoolean({ message: 'active debe ser un valor booleano' })
  active: boolean;
}