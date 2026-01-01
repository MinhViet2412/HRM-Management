import { DependentRelationship } from '../../database/entities/dependent.entity';
export declare class CreateDependentDto {
    fullName: string;
    dateOfBirth?: string;
    relationship: DependentRelationship;
    citizenId?: string;
    taxCode?: string;
    address?: string;
    phone?: string;
    isActive?: boolean;
    deductionAmount?: number;
    notes?: string;
    employeeId: string;
}
