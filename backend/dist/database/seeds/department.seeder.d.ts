import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';
export declare class DepartmentSeeder {
    private departmentRepository;
    constructor(departmentRepository: Repository<Department>);
    run(): Promise<void>;
}
