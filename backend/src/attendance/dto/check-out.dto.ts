import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckOutDto {
  @ApiProperty({ example: '2023-12-01T18:00:00Z', required: false })
  @IsOptional()
  checkOutTime?: Date;

  @ApiProperty({ example: 'Work completed', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
