import { Employee } from './employee.entity';
export declare enum LeaveType {
    ANNUAL = "annual",
    SICK = "sick",
    MATERNITY = "maternity",
    UNPAID = "unpaid"
}
export declare enum LeaveStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    CANCELLED = "cancelled"
}
export declare class LeaveRequest {
    id: string;
    employeeId: string;
    type: LeaveType;
    startDate: Date;
    endDate: Date;
    days: number;
    reason: string;
    notes: string;
    status: LeaveStatus;
    approvedBy: string;
    approvedAt: Date;
    rejectionReason: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
}
