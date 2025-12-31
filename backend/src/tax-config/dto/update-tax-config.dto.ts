import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateTaxConfigDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateDependentDeductionDto {
  @IsNumber()
  @Min(0)
  amount: number; // Giá trị giảm trừ (VNĐ)
}

