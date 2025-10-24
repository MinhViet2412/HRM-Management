import { AttendanceStatus } from '../../database/entities/attendance.entity';
export declare class AdjustAttendanceDto {
    checkIn?: string;
    checkOut?: string;
    status?: AttendanceStatus;
    reason?: string;
    notes?: string;
}
