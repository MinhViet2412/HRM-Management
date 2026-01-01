import {
  IsEnum,
  IsNumber,
  IsInt,
  IsOptional,
  IsBoolean,
  IsString,
  Min,
} from 'class-validator';
import { LeaveType } from '../../database/entities/leave-request.entity';

export class CreateLeaveLimitConfigDto {
  @IsEnum(LeaveType)
  leaveType: LeaveType;

  @IsInt()
  @Min(2000)
  year: number;

  @IsNumber()
  @Min(0)
  maxDays: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

