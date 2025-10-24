import { Repository } from 'typeorm';
import { ContractTemplate } from '../entities/contract-template.entity';
import { ContractType } from '../entities/contract-type.entity';
export declare class ContractTemplateSeeder {
    private readonly templateRepo;
    private readonly typeRepo;
    constructor(templateRepo: Repository<ContractTemplate>, typeRepo: Repository<ContractType>);
    run(): Promise<void>;
}
