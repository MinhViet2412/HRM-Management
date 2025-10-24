import { Repository } from 'typeorm';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { OvertimeRequest } from '../database/entities/overtime-request.entity';
export declare class PayrollService {
    private payrollRepository;
    private employeeRepository;
    private attendanceRepository;
    private overtimeRepository;
    constructor(payrollRepository: Repository<Payroll>, employeeRepository: Repository<Employee>, attendanceRepository: Repository<Attendance>, overtimeRepository: Repository<OvertimeRequest>);
    generatePayroll(period: string, targetEmployeeId?: string): Promise<Payroll[]>;
    getPayrollByEmployee(employeeId: string, period?: string): Promise<Payroll[]>;
    getPayrollByPeriod(period: string): Promise<Payroll[]>;
    approvePayroll(id: string, approvedBy: string): Promise<Payroll>;
    private getWorkingDaysInMonth;
    private calculateTax;
    private calculatePersonalIncomeTax;
    generatePayrollPdf(id: string, requester: any): Promise<{
        stream: NodeJS.ReadableStream;
        filename: string;
    }>;
}
