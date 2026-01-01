import { User } from './user.entity';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { Attendance } from './attendance.entity';
import { LeaveRequest } from './leave-request.entity';
import { Payroll } from './payroll.entity';
import { WorkLocation } from './work-location.entity';
import { Shift } from './shift.entity';
import { Dependent } from './dependent.entity';
export declare enum EmployeeStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    TERMINATED = "terminated"
}
export declare enum Gender {
    MALE = "male",
    FEMALE = "female",
    OTHER = "other"
}
export declare class Employee {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    permanentAddress: string;
    currentAddress: string;
    dateOfBirth: Date;
    gender: Gender;
    nationalId: string;
    citizenId: string;
    taxId: string;
    bankAccount: string;
    bankName: string;
    ethnicity: string;
    religion: string;
    basicSalary: number;
    allowance: number;
    hireDate: Date;
    terminationDate: Date;
    status: EmployeeStatus;
    avatar: string;
    emergencyContact: string;
    emergencyPhone: string;
    annualLeaveBalance: number;
    sickLeaveBalance: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    department: Department;
    departmentId: string;
    position: Position;
    positionId: string;
    attendances: Attendance[];
    workLocation: WorkLocation;
    workLocationId: string;
    shift: Shift;
    shiftId: string;
    leaveRequests: LeaveRequest[];
    payrolls: Payroll[];
    dependents: Dependent[];
}
