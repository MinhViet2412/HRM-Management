import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(createEmployeeDto: CreateEmployeeDto): Promise<import("../database/entities/employee.entity").Employee>;
    uploadAvatar(id: string, file: any): Promise<import("../database/entities/employee.entity").Employee>;
    findAll(active?: boolean): Promise<import("../database/entities/employee.entity").Employee[]>;
    findOne(id: string): Promise<import("../database/entities/employee.entity").Employee>;
    findByCode(code: string): Promise<import("../database/entities/employee.entity").Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<import("../database/entities/employee.entity").Employee>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
