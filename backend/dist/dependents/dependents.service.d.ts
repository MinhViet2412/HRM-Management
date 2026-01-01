import { Repository } from 'typeorm';
import { Dependent } from '../database/entities/dependent.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { TaxConfigService } from '../tax-config/tax-config.service';
export declare class DependentsService {
    private dependentRepository;
    private employeeRepository;
    private taxConfigService;
    constructor(dependentRepository: Repository<Dependent>, employeeRepository: Repository<Employee>, taxConfigService: TaxConfigService);
    create(createDependentDto: CreateDependentDto): Promise<Dependent>;
    findAll(employeeId?: string): Promise<Dependent[]>;
    findOne(id: string): Promise<Dependent>;
    findByEmployeeId(employeeId: string): Promise<Dependent[]>;
    update(id: string, updateDependentDto: UpdateDependentDto): Promise<Dependent>;
    remove(id: string): Promise<void>;
    getActiveDependentsCount(employeeId: string): Promise<number>;
}
