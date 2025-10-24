import { Repository } from 'typeorm';
import { ContractType } from '../database/entities/contract-type.entity';
import { CreateContractTypeDto, UpdateContractTypeDto } from './dto';
export declare class ContractTypesService {
    private readonly contractTypeRepository;
    constructor(contractTypeRepository: Repository<ContractType>);
    create(createContractTypeDto: CreateContractTypeDto): Promise<ContractType>;
    findAll(): Promise<ContractType[]>;
    findOne(id: string): Promise<ContractType>;
    update(id: string, updateContractTypeDto: UpdateContractTypeDto): Promise<ContractType>;
    remove(id: string): Promise<void>;
    findByName(name: string): Promise<ContractType | null>;
}
