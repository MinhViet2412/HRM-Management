import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeDto } from './create-employee.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({ example: 'NewStrongPassw0rd!', required: false })
  @IsOptional()
  @IsString()
  password?: string;
}
