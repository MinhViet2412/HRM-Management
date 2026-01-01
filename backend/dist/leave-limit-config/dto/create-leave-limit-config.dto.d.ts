import { LeaveType } from '../../database/entities/leave-request.entity';
export declare class CreateLeaveLimitConfigDto {
    leaveType: LeaveType;
    year: number;
    maxDays: number;
    description?: string;
    isActive?: boolean;
}
