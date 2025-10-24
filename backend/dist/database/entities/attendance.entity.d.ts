import { Employee } from './employee.entity';
export declare enum AttendanceStatus {
    PRESENT = "present",
    ABSENT = "absent",
    LATE = "late",
    HALF_DAY = "half_day",
    EARLY_LEAVE = "early_leave"
}
export declare class Attendance {
    id: string;
    employeeId: string;
    date: Date;
    checkIn: Date;
    checkOut: Date;
    breakStart: Date;
    breakEnd: Date;
    workingHours: number;
    overtimeHours: number;
    status: AttendanceStatus;
    notes: string;
    approvedBy: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
}
