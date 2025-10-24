import { Repository } from 'typeorm';
import { ContractType } from '../entities/contract-type.entity';
export declare class ContractTypeSeeder {
    private readonly repo;
    constructor(repo: Repository<ContractType>);
    run(): Promise<void>;
}
