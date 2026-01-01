import { Repository } from 'typeorm';
import { InsuranceConfig, InsuranceType } from '../database/entities/insurance-config.entity';
import { CreateInsuranceConfigDto } from './dto/create-insurance-config.dto';
import { UpdateInsuranceConfigDto } from './dto/update-insurance-config.dto';
export declare class InsuranceConfigService {
    private insuranceConfigRepository;
    constructor(insuranceConfigRepository: Repository<InsuranceConfig>);
    create(createDto: CreateInsuranceConfigDto): Promise<InsuranceConfig>;
    findAll(): Promise<InsuranceConfig[]>;
    findActive(): Promise<InsuranceConfig[]>;
    findOne(id: string): Promise<InsuranceConfig>;
    findByType(type: InsuranceType): Promise<InsuranceConfig>;
    update(id: string, updateDto: UpdateInsuranceConfigDto): Promise<InsuranceConfig>;
    remove(id: string): Promise<void>;
    calculateEmployeeInsurance(salary: number, type: InsuranceType): Promise<number>;
    calculateEmployerInsurance(salary: number, type: InsuranceType): Promise<number>;
    calculateTotalInsurance(salary: number, type: InsuranceType): Promise<number>;
}
