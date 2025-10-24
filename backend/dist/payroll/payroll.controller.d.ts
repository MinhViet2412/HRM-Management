import { Response } from 'express';
import { PayrollService } from './payroll.service';
export declare class PayrollController {
    private readonly payrollService;
    constructor(payrollService: PayrollService);
    generatePayroll(period: string, employeeId?: string): Promise<import("../database/entities/payroll.entity").Payroll[]>;
    getPayrollByEmployee(employeeId: string, period?: string): Promise<import("../database/entities/payroll.entity").Payroll[]>;
    getPayrollByPeriod(period: string): Promise<import("../database/entities/payroll.entity").Payroll[]>;
    downloadPayrollPdf(id: string, res: Response, req: any): Promise<void>;
    approvePayroll(id: string, req: any): Promise<import("../database/entities/payroll.entity").Payroll>;
    getStandardHours(period: string): Promise<{
        period: string;
        standardWorkingDays: any;
        standardWorkingHours: number;
    }>;
}
