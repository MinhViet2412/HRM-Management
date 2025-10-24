import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../database/entities/role.entity';

export const Roles = (...roles: RoleName[]) => SetMetadata('roles', roles);
