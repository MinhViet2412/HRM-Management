import { PartialType } from '@nestjs/swagger';
import { CreateStandardWorkingHoursDto } from './create-standard-working-hours.dto';

export class UpdateStandardWorkingHoursDto extends PartialType(CreateStandardWorkingHoursDto) {}

