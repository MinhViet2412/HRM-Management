import { LeaveType } from './leave-request.entity';
export declare class LeaveLimitConfig {
    id: string;
    leaveType: LeaveType;
    year: number;
    maxDays: number;
    description: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
