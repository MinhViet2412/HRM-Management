import { IsInt, IsNumber, Min, Max, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStandardWorkingHoursDto {
  @ApiProperty({ example: 2025, description: 'Năm' })
  @IsInt()
  @Min(2000)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 12, description: 'Tháng (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 184, description: 'Số giờ công chuẩn trong tháng' })
  @IsNumber()
  @Min(0)
  standardHours: number;

  @ApiProperty({ example: 23, description: 'Số ngày công chuẩn trong tháng' })
  @IsNumber()
  @Min(0)
  standardDays: number;

  @ApiProperty({ required: false, description: 'Mô tả' })
  @IsOptional()
  @IsString()
  description?: string;
}

