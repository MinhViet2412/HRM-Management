import { Employee } from './employee.entity';
import { ContractType } from './contract-type.entity';
export declare enum ContractStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    TERMINATED = "terminated",
    PENDING = "pending"
}
export declare class Contract {
    id: string;
    contractCode: string;
    employee: Employee;
    employeeId: string;
    type?: ContractType | null;
    typeId?: string | null;
    startDate: Date;
    endDate?: Date | null;
    status: ContractStatus;
    baseSalary: number;
    allowance: number;
    bonus: number;
    benefits?: Record<string, unknown> | null;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
