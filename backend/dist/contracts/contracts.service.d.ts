import { Repository } from 'typeorm';
import { Contract } from '../database/entities/contract.entity';
import { ContractTemplate } from '../database/entities/contract-template.entity';
import { RoleName } from '../database/entities/role.entity';
import { Employee } from '../database/entities/employee.entity';
import { ContractTypesService } from '../contract-types/contract-types.service';
import { CreateContractDto, UpdateContractDto, CreateContractTemplateDto, UpdateContractTemplateDto } from './dto';
export declare class ContractsService {
    private readonly contractRepo;
    private readonly contractTemplateRepo;
    private readonly employeeRepo;
    private readonly contractTypesService;
    constructor(contractRepo: Repository<Contract>, contractTemplateRepo: Repository<ContractTemplate>, employeeRepo: Repository<Employee>, contractTypesService: ContractTypesService);
    createContract(dto: CreateContractDto): Promise<Contract>;
    getContracts(currentUser?: {
        role: RoleName;
        employeeId?: string;
        departmentId?: string;
    }): Promise<Contract[]>;
    getContract(id: string, currentUser?: {
        role: RoleName;
        employeeId?: string;
        departmentId?: string;
    }): Promise<Contract>;
    updateContract(id: string, dto: UpdateContractDto): Promise<Contract>;
    deleteContract(id: string): Promise<{
        success: boolean;
    }>;
    approveContract(id: string): Promise<Contract>;
    rejectContract(id: string, reason?: string): Promise<Contract>;
    createTemplate(dto: CreateContractTemplateDto): Promise<ContractTemplate>;
    getTemplates(): Promise<ContractTemplate[]>;
    updateTemplate(id: string, dto: UpdateContractTemplateDto): Promise<ContractTemplate>;
    deleteTemplate(id: string): Promise<{
        success: boolean;
    }>;
}
