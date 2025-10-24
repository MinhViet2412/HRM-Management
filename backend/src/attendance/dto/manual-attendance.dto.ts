import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class ManualAttendanceDto {
  @ApiProperty({ description: 'Date of attendance (YYYY-MM-DD)' })
  @IsDateString()
  date: string;

  @ApiProperty({ description: 'Check-in ISO time', required: false })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiProperty({ description: 'Check-out ISO time', required: false })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ description: 'Employee code (alternative to employeeId)', required: false })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}


