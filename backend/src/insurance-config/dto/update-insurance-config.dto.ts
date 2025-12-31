import { PartialType } from '@nestjs/mapped-types';
import { CreateInsuranceConfigDto } from './create-insurance-config.dto';

export class UpdateInsuranceConfigDto extends PartialType(CreateInsuranceConfigDto) {}

