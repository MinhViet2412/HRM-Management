import { Employee } from './employee.entity';
export declare enum PayrollStatus {
    DRAFT = "draft",
    GENERATED = "generated",
    APPROVED = "approved",
    PAID = "paid"
}
export declare class Payroll {
    id: string;
    employeeId: string;
    period: string;
    basicSalary: number;
    allowance: number;
    overtimePay: number;
    bonus: number;
    grossSalary: number;
    tax: number;
    socialInsurance: number;
    healthInsurance: number;
    unemploymentInsurance: number;
    totalDeductions: number;
    netSalary: number;
    workingDays: number;
    actualWorkingDays: number;
    status: PayrollStatus;
    notes: string;
    approvedBy: string;
    approvedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
}
