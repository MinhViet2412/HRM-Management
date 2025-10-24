import { Employee } from './employee.entity';
import { Payroll } from './payroll.entity';
export declare enum PayslipStatus {
    ISSUED = "issued",
    PAID = "paid",
    CANCELLED = "cancelled"
}
export declare class Payslip {
    id: string;
    employeeId: string;
    period: string;
    payrollId: string;
    amount: number;
    status: PayslipStatus;
    issuedBy: string;
    paidAt: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    payroll: Payroll;
}
