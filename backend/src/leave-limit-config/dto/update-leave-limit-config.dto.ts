import { PartialType } from '@nestjs/mapped-types';
import { CreateLeaveLimitConfigDto } from './create-leave-limit-config.dto';

export class UpdateLeaveLimitConfigDto extends PartialType(CreateLeaveLimitConfigDto) {}

