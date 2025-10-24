import { Employee } from './employee.entity';
import { User } from './user.entity';
export declare enum ResignationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    PROCESSED = "processed"
}
export declare class ResignationRequest {
    id: string;
    employee: Employee;
    employeeId: string;
    requestedBy: User;
    requestedById: string;
    effectiveDate: Date;
    reason: string;
    status: ResignationStatus;
    approvedBy: User;
    approvedById: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
