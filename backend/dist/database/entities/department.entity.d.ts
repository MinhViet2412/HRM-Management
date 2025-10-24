import { Employee } from './employee.entity';
export declare class Department {
    id: string;
    code: string;
    name: string;
    description: string;
    managerId: string;
    parentId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    employees: Employee[];
    parent: Department;
    children: Department[];
}
