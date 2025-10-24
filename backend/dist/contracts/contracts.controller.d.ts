import { ContractsService } from './contracts.service';
import { CreateContractDto, UpdateContractDto, CreateContractTemplateDto, UpdateContractTemplateDto } from './dto';
import { ContractTypesService } from '../contract-types/contract-types.service';
import { Request } from 'express';
export declare class ContractsController {
    private readonly contractsService;
    private readonly contractTypesService;
    constructor(contractsService: ContractsService, contractTypesService: ContractTypesService);
    create(dto: CreateContractDto): Promise<import("../database/entities/contract.entity").Contract>;
    findAll(req: Request): Promise<import("../database/entities/contract.entity").Contract[]>;
    findTypes(): Promise<import("../database/entities/contract-type.entity").ContractType[]>;
    createTemplate(dto: CreateContractTemplateDto): Promise<import("../database/entities/contract-template.entity").ContractTemplate>;
    findTemplates(): Promise<import("../database/entities/contract-template.entity").ContractTemplate[]>;
    updateTemplate(id: string, dto: UpdateContractTemplateDto): Promise<import("../database/entities/contract-template.entity").ContractTemplate>;
    removeTemplate(id: string): Promise<{
        success: boolean;
    }>;
    findOne(id: string, req: Request): Promise<import("../database/entities/contract.entity").Contract>;
    update(id: string, dto: UpdateContractDto): Promise<import("../database/entities/contract.entity").Contract>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    approve(id: string): Promise<import("../database/entities/contract.entity").Contract>;
    reject(id: string, reason?: string): Promise<import("../database/entities/contract.entity").Contract>;
}
