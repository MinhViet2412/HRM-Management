import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CheckInDto {
  @ApiProperty({ example: '2023-12-01T09:00:00Z', required: false })
  @IsOptional()
  checkInTime?: Date;

  @ApiProperty({ example: 'Late due to traffic', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 10.762622, required: false })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: 106.660172, required: false })
  @IsOptional()
  @IsNumber()
  longitude?: number;
}
