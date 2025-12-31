import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { InsuranceType } from '../../database/entities/insurance-config.entity';

export class CreateInsuranceConfigDto {
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @IsNumber()
  @Min(0)
  @Max(100)
  insuranceRate: number; // Tỷ lệ % đóng bảo hiểm

  @IsString()
  salaryType: string; // Loại lương tính bảo hiểm: "contract_total_income" hoặc "basic_salary"

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employeeRate?: number; // Tỷ lệ % người lao động (tùy chọn, nếu null thì dùng insuranceRate)

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerRate?: number; // Tỷ lệ % người sử dụng lao động (tùy chọn, nếu null thì dùng insuranceRate)

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

