import { Employee } from './employee.entity';
export declare enum DependentRelationship {
    SPOUSE = "spouse",
    CHILD = "child",
    PARENT = "parent",
    SIBLING = "sibling",
    OTHER = "other"
}
export declare class Dependent {
    id: string;
    fullName: string;
    dateOfBirth: Date;
    relationship: DependentRelationship;
    citizenId: string;
    taxCode: string;
    address: string;
    phone: string;
    isActive: boolean;
    deductionAmount: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    employeeId: string;
}
