import { IsUUID, IsEnum, IsOptional, IsString, IsDateString, IsNumber, Min, IsPositive, IsObject } from 'class-validator';
import { ContractStatus } from '../../database/entities/contract.entity';

export class CreateContractDto {
  @IsString()
  contractCode: string;

  @IsUUID()
  employeeId: string;

  @IsOptional()
  @IsUUID()
  typeId?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsNumber()
  @IsPositive()
  baseSalary: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  allowance?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bonus?: number;

  @IsOptional()
  @IsObject()
  benefits?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateContractDto extends CreateContractDto {}

export class CreateContractTypeDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardTermMonths?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  probationMonths?: number;
}

export class UpdateContractTypeDto extends CreateContractTypeDto {}

export class CreateContractTemplateDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  typeId?: string;
}

export class UpdateContractTemplateDto extends CreateContractTemplateDto {}


