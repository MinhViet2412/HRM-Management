import { DepartmentsService } from './departments.service';
export declare class DepartmentsController {
    private readonly departmentsService;
    constructor(departmentsService: DepartmentsService);
    create(createDepartmentDto: any): Promise<import("../database/entities/department.entity").Department>;
    findAll(): Promise<import("../database/entities/department.entity").Department[]>;
    findOne(id: string): Promise<import("../database/entities/department.entity").Department>;
    update(id: string, updateDepartmentDto: any): Promise<import("../database/entities/department.entity").Department>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
