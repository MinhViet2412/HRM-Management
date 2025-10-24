import { Employee } from './employee.entity';
export declare class WorkLocation {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    radius: number;
    createdAt: Date;
    updatedAt: Date;
    employees: Employee[];
}
