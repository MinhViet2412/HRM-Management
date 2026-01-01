import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
export declare class DependentsController {
    private readonly dependentsService;
    constructor(dependentsService: DependentsService);
    create(createDependentDto: CreateDependentDto): Promise<import("../database/entities/dependent.entity").Dependent>;
    findAll(employeeId?: string): Promise<import("../database/entities/dependent.entity").Dependent[]>;
    findByEmployeeId(employeeId: string): Promise<import("../database/entities/dependent.entity").Dependent[]>;
    getActiveCount(employeeId: string): Promise<number>;
    findOne(id: string): Promise<import("../database/entities/dependent.entity").Dependent>;
    update(id: string, updateDependentDto: UpdateDependentDto): Promise<import("../database/entities/dependent.entity").Dependent>;
    remove(id: string): Promise<void>;
}
