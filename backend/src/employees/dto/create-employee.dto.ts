import { IsEmail, IsString, IsOptional, IsEnum, IsDateString, IsUUID, IsNumber, Min, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender, EmployeeStatus } from '../../database/entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'EMP0001', required: false, description: 'Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  

  @ApiProperty({ example: 'john.doe@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'StrongPassw0rd!', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: '123 Main St, City, State', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '123 Permanent St, City', required: false })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiProperty({ example: '456 Current Ave, City', required: false })
  @IsOptional()
  @IsString()
  currentAddress?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ enum: Gender, required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiProperty({ example: '012345678901', required: false, description: 'Citizen ID (CCCD)' })
  @IsOptional()
  @IsString()
  citizenId?: string;

  @ApiProperty({ example: 'TAX123456', required: false })
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiProperty({ example: '1234567890', required: false })
  @IsOptional()
  @IsString()
  bankAccount?: string;

  @ApiProperty({ example: 'Bank of America', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ example: 'Kinh', required: false })
  @IsOptional()
  @IsString()
  ethnicity?: string;

  @ApiProperty({ example: 'Không', required: false })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  basicSalary?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  allowance?: number;

  @ApiProperty({ example: 'avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ example: '2023-01-01', required: false })
  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @ApiProperty({ enum: EmployeeStatus, default: EmployeeStatus.ACTIVE })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiProperty({ example: 'Emergency Contact Name', required: false })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiProperty()
  @IsUUID()
  departmentId: string;

  @ApiProperty()
  @IsUUID()
  positionId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf((o) => o.workLocationId !== null && o.workLocationId !== undefined)
  @IsUUID()
  workLocationId?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateIf((o) => o.shiftId !== null && o.shiftId !== undefined)
  @IsUUID()
  shiftId?: string | null;
}
