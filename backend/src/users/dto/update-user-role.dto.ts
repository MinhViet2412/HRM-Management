import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleName } from '../../database/entities/role.entity';

export class UpdateUserRoleDto {
  @ApiProperty({ enum: RoleName, required: false, description: 'Role name to assign' })
  @IsOptional()
  @IsEnum(RoleName)
  roleName?: RoleName;

  @ApiProperty({ required: false, description: 'Role id to assign (alternative to roleName)' })
  @IsOptional()
  @IsString()
  roleId?: string;
}


