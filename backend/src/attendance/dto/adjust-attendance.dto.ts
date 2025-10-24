import { IsOptional, IsString, IsDateString, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '../../database/entities/attendance.entity';

export class AdjustAttendanceDto {
  @ApiProperty({ description: 'New check-in time', required: false })
  @IsOptional()
  @IsDateString()
  checkIn?: string;

  @ApiProperty({ description: 'New check-out time', required: false })
  @IsOptional()
  @IsDateString()
  checkOut?: string;

  @ApiProperty({ description: 'New attendance status', enum: AttendanceStatus, required: false })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @ApiProperty({ description: 'Reason for adjustment', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
