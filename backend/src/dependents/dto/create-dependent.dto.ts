import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';
import { DependentRelationship } from '../../database/entities/dependent.entity';

export class CreateDependentDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsEnum(DependentRelationship)
  relationship: DependentRelationship;

  @IsOptional()
  @IsString()
  citizenId?: string;

  @IsOptional()
  @IsString()
  taxCode?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deductionAmount?: number; // Giá trị giảm trừ (VNĐ)

  @IsOptional()
  @IsString()
  notes?: string;

  @IsUUID()
  employeeId: string;
}

