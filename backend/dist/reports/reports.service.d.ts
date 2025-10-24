import { Repository } from 'typeorm';
import { Employee } from '../database/entities/employee.entity';
import { Department } from '../database/entities/department.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Payroll } from '../database/entities/payroll.entity';
export declare class ReportsService {
    private employeeRepository;
    private departmentRepository;
    private attendanceRepository;
    private payrollRepository;
    constructor(employeeRepository: Repository<Employee>, departmentRepository: Repository<Department>, attendanceRepository: Repository<Attendance>, payrollRepository: Repository<Payroll>);
    getAttendanceSummary(startDate: Date, endDate: Date, departmentId?: string): Promise<any>;
    getStaffingByDepartment(): Promise<any[]>;
    getPayrollSummary(period: string): Promise<any>;
    getEmployeePerformance(employeeId: string, startDate: Date, endDate: Date): Promise<any>;
    getPersonnelTurnover(startDate: Date, endDate: Date, departmentId?: string): Promise<any>;
    exportAttendanceSummaryToExcel(startDate: Date, endDate: Date, departmentId?: string): Promise<Buffer>;
    exportPayrollSummaryToExcel(period: string): Promise<Buffer>;
    exportPersonnelTurnoverToExcel(startDate: Date, endDate: Date, departmentId?: string): Promise<Buffer>;
    exportStaffingByDepartmentToExcel(): Promise<Buffer>;
}
