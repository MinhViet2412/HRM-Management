import { Repository } from 'typeorm';
import { Employee } from '../database/entities/employee.entity';
import { Department } from '../database/entities/department.entity';
import { Position } from '../database/entities/position.entity';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { WorkLocation } from '../database/entities/work-location.entity';
import { Shift } from '../database/entities/shift.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
export declare class EmployeesService {
    private employeeRepository;
    private departmentRepository;
    private positionRepository;
    private userRepository;
    private roleRepository;
    private workLocationRepository;
    private shiftRepository;
    constructor(employeeRepository: Repository<Employee>, departmentRepository: Repository<Department>, positionRepository: Repository<Position>, userRepository: Repository<User>, roleRepository: Repository<Role>, workLocationRepository: Repository<WorkLocation>, shiftRepository: Repository<Shift>);
    private generateEmployeeCode;
    create(createEmployeeDto: CreateEmployeeDto): Promise<Employee>;
    findAll(): Promise<Employee[]>;
    findOne(id: string): Promise<Employee>;
    findByCode(employeeCode: string): Promise<Employee>;
    update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee>;
    updateAvatar(id: string, filename: string): Promise<Employee>;
    remove(id: string): Promise<void>;
    getActiveEmployees(): Promise<Employee[]>;
}
