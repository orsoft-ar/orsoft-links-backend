import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class ReorderLinkItemDto {
  @ApiProperty({ example: 5 })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  position: number;
}

export class ReorderLinksDto {
  @ApiProperty({ type: [ReorderLinkItemDto] })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debes enviar al menos un link' })
  @ValidateNested({ each: true })
  @Type(() => ReorderLinkItemDto)
  links: ReorderLinkItemDto[];
}