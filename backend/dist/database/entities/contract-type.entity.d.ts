import { Contract } from './contract.entity';
export declare class ContractType {
    id: string;
    name: string;
    description?: string | null;
    standardTermMonths?: number | null;
    probationMonths?: number | null;
    createdAt: Date;
    updatedAt: Date;
    contracts: Contract[];
}
