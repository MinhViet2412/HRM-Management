import { ContractType } from './contract-type.entity';
export declare class ContractTemplate {
    id: string;
    name: string;
    content: string;
    type?: ContractType | null;
    createdAt: Date;
    updatedAt: Date;
}
