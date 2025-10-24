import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdjustAttendanceDto } from './dto/adjust-attendance.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    checkIn(req: any, checkInDto: CheckInDto & {
        employeeId?: string;
    }): Promise<import("../database/entities/attendance.entity").Attendance>;
    checkOut(req: any, checkOutDto: CheckOutDto & {
        employeeId?: string;
    }): Promise<import("../database/entities/attendance.entity").Attendance>;
    getMyAttendance(req: any, startDate?: string, endDate?: string, employeeIdQuery?: string): Promise<import("../database/entities/attendance.entity").Attendance[]>;
    getEmployeeAttendance(employeeId: string, startDate?: string, endDate?: string): Promise<import("../database/entities/attendance.entity").Attendance[]>;
    getAttendanceByDate(date: string): Promise<import("../database/entities/attendance.entity").Attendance[]>;
    getAttendanceWithFilters(startDate?: string, endDate?: string, departmentId?: string): Promise<import("../database/entities/attendance.entity").Attendance[]>;
    closeMissingCheckout(employeeId: string, date: string, req: any): Promise<import("../database/entities/attendance.entity").Attendance>;
    getAttendanceSummary(employeeId: string, startDate: string, endDate: string): Promise<any>;
    adjustAttendance(attendanceId: string, adjustDto: AdjustAttendanceDto, req: any): Promise<import("../database/entities/attendance.entity").Attendance>;
    manualUpsert(body: ManualAttendanceDto, req: any): Promise<import("../database/entities/attendance.entity").Attendance>;
    testCalculation(testData: {
        checkIn: string;
        checkOut: string;
        shiftId: string;
    }): Promise<any>;
    testRules(testData: {
        checkIn?: string;
        checkOut?: string;
    }): Promise<any>;
    getRules(): Promise<any>;
    reEvaluateAttendance(filterData: {
        startDate?: string;
        endDate?: string;
        departmentId?: string;
    }): Promise<any>;
}
