import { ContractStatus } from '../../database/entities/contract.entity';
export declare class CreateContractDto {
    contractCode: string;
    employeeId: string;
    typeId?: string;
    startDate: string;
    endDate?: string;
    status?: ContractStatus;
    baseSalary: number;
    allowance?: number;
    bonus?: number;
    benefits?: Record<string, unknown>;
    notes?: string;
}
export declare class UpdateContractDto extends CreateContractDto {
}
export declare class CreateContractTypeDto {
    name: string;
    description?: string;
    standardTermMonths?: number;
    probationMonths?: number;
}
export declare class UpdateContractTypeDto extends CreateContractTypeDto {
}
export declare class CreateContractTemplateDto {
    name: string;
    content: string;
    typeId?: string;
}
export declare class UpdateContractTemplateDto extends CreateContractTemplateDto {
}
