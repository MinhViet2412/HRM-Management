import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, Matches } from 'class-validator';

export class CreateOvertimeDto {
  @ApiProperty({ example: '2025-10-10' })
  @IsDateString()
  date: string;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  startTime: string;

  @ApiProperty({ example: '21:30' })
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  endTime: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ required: false, description: 'Assignee approver userId' })
  @IsOptional()
  @IsString()
  approverId?: string;
}


