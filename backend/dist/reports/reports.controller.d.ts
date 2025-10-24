import { ReportsService } from './reports.service';
import { Response } from 'express';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getAttendanceSummary(startDate: string, endDate: string, departmentId?: string): Promise<any>;
    getStaffingByDepartment(): Promise<any[]>;
    getPayrollSummary(period: string): Promise<any>;
    getEmployeePerformance(employeeId: string, startDate: string, endDate: string): Promise<any>;
    getPersonnelTurnover(startDate: string, endDate: string, departmentId?: string): Promise<any>;
    exportAttendanceSummary(startDate: string, endDate: string, res: Response, departmentId?: string): Promise<void>;
    exportPayrollSummary(period: string, res: Response): Promise<void>;
    exportPersonnelTurnover(startDate: string, endDate: string, res: Response, departmentId?: string): Promise<void>;
    exportStaffingByDepartment(res: Response): Promise<void>;
}
