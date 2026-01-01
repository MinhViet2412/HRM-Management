import { Repository } from 'typeorm';
import { TaxConfig } from '../database/entities/tax-config.entity';
import { UpdateTaxConfigDto, UpdateDependentDeductionDto } from './dto/update-tax-config.dto';
export declare class TaxConfigService {
    private taxConfigRepository;
    private readonly DEPENDENT_DEDUCTION_KEY;
    private readonly DEFAULT_DEDUCTION_AMOUNT;
    constructor(taxConfigRepository: Repository<TaxConfig>);
    getDependentDeductionAmount(): Promise<number>;
    updateDependentDeductionAmount(dto: UpdateDependentDeductionDto): Promise<TaxConfig>;
    findAll(): Promise<TaxConfig[]>;
    findByKey(key: string): Promise<TaxConfig>;
    update(key: string, updateDto: UpdateTaxConfigDto): Promise<TaxConfig>;
}
