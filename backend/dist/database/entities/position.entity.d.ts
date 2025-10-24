import { Employee } from './employee.entity';
import { Department } from './department.entity';
export declare class Position {
    id: string;
    code: string;
    title: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    employees: Employee[];
    department: Department;
    departmentId: string;
}
