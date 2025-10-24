import { Repository } from 'typeorm';
import { Payslip, PayslipStatus } from '../database/entities/payslip.entity';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
export declare class PayslipsService {
    private payslipRepo;
    private payrollRepo;
    private employeeRepo;
    private attendanceRepo;
    constructor(payslipRepo: Repository<Payslip>, payrollRepo: Repository<Payroll>, employeeRepo: Repository<Employee>, attendanceRepo: Repository<Attendance>);
    list(period: string): Promise<Payslip[]>;
    listByEmployee(employeeId: string, period: string): Promise<Payslip[]>;
    get(id: string): Promise<Payslip>;
    bulkCreate(period: string, employeeIds?: string[]): Promise<Payslip[]>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    updateStatus(id: string, status: PayslipStatus): Promise<Payslip>;
}
