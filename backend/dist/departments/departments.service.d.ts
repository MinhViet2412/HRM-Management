import { Repository } from 'typeorm';
import { Department } from '../database/entities/department.entity';
export declare class DepartmentsService {
    private departmentRepository;
    constructor(departmentRepository: Repository<Department>);
    create(createDepartmentDto: any): Promise<Department>;
    findAll(): Promise<Department[]>;
    findOne(id: string): Promise<Department>;
    update(id: string, updateDepartmentDto: any): Promise<Department>;
    remove(id: string): Promise<void>;
}
