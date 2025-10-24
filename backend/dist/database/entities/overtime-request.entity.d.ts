import { Employee } from './employee.entity';
export declare enum OvertimeStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class OvertimeRequest {
    id: string;
    employeeId: string;
    employee: Employee;
    date: Date;
    startTime: string;
    endTime: string;
    hours: number;
    reason: string | null;
    status: OvertimeStatus;
    approverId: string | null;
    approvedAt: Date | null;
    rejectionReason: string | null;
    createdAt: Date;
    updatedAt: Date;
}
