import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContractTypeDto {
  @ApiProperty({ example: 'Hợp đồng chính thức' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Hợp đồng lao động chính thức không xác định thời hạn', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  standardTermMonths?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  probationMonths?: number;
}

export class UpdateContractTypeDto {
  @ApiProperty({ example: 'Hợp đồng chính thức', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Hợp đồng lao động chính thức không xác định thời hạn', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 12, required: false })
  @IsOptional()
  @IsNumber()
  standardTermMonths?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  probationMonths?: number;
}
