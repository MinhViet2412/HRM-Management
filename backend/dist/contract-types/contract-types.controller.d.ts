import { ContractTypesService } from './contract-types.service';
import { CreateContractTypeDto, UpdateContractTypeDto } from './dto';
export declare class ContractTypesController {
    private readonly contractTypesService;
    constructor(contractTypesService: ContractTypesService);
    create(dto: CreateContractTypeDto): Promise<import("../database/entities/contract-type.entity").ContractType>;
    findAll(): Promise<import("../database/entities/contract-type.entity").ContractType[]>;
    findOne(id: string): Promise<import("../database/entities/contract-type.entity").ContractType>;
    update(id: string, dto: UpdateContractTypeDto): Promise<import("../database/entities/contract-type.entity").ContractType>;
    remove(id: string): Promise<void>;
}
