import { Repository } from 'typeorm';
import { Employee } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
export declare class EmployeeSeeder {
    private employeeRepository;
    private departmentRepository;
    private positionRepository;
    constructor(employeeRepository: Repository<Employee>, departmentRepository: Repository<Department>, positionRepository: Repository<Position>);
    run(): Promise<void>;
}
