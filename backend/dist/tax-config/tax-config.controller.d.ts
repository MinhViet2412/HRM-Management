import { TaxConfigService } from './tax-config.service';
import { UpdateTaxConfigDto, UpdateDependentDeductionDto } from './dto/update-tax-config.dto';
export declare class TaxConfigController {
    private readonly taxConfigService;
    constructor(taxConfigService: TaxConfigService);
    findAll(): Promise<import("../database/entities/tax-config.entity").TaxConfig[]>;
    getDependentDeductionAmount(): Promise<number>;
    updateDependentDeductionAmount(dto: UpdateDependentDeductionDto): Promise<import("../database/entities/tax-config.entity").TaxConfig>;
    findByKey(key: string): Promise<import("../database/entities/tax-config.entity").TaxConfig>;
    update(key: string, updateDto: UpdateTaxConfigDto): Promise<import("../database/entities/tax-config.entity").TaxConfig>;
}
