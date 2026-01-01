import { InsuranceConfigService } from './insurance-config.service';
import { CreateInsuranceConfigDto } from './dto/create-insurance-config.dto';
import { UpdateInsuranceConfigDto } from './dto/update-insurance-config.dto';
import { InsuranceType } from '../database/entities/insurance-config.entity';
export declare class InsuranceConfigController {
    private readonly insuranceConfigService;
    constructor(insuranceConfigService: InsuranceConfigService);
    create(createDto: CreateInsuranceConfigDto): Promise<import("../database/entities/insurance-config.entity").InsuranceConfig>;
    findAll(activeOnly?: string): Promise<import("../database/entities/insurance-config.entity").InsuranceConfig[]>;
    calculate(salary: string, type: InsuranceType): Promise<number>;
    findOne(id: string): Promise<import("../database/entities/insurance-config.entity").InsuranceConfig>;
    update(id: string, updateDto: UpdateInsuranceConfigDto): Promise<import("../database/entities/insurance-config.entity").InsuranceConfig>;
    remove(id: string): Promise<void>;
}
