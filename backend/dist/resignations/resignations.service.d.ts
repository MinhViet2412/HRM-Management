import { Repository } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../database/entities/resignation-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
export declare class ResignationsService {
    private resignationRepo;
    private employeeRepo;
    private userRepo;
    constructor(resignationRepo: Repository<ResignationRequest>, employeeRepo: Repository<Employee>, userRepo: Repository<User>);
    requestResignation(employeeId: string, requestedById: string, effectiveDate: string, reason?: string): Promise<ResignationRequest>;
    approve(id: string, approverId: string): Promise<ResignationRequest>;
    reject(id: string, approverId: string): Promise<ResignationRequest>;
    list(status?: ResignationStatus): Promise<ResignationRequest[]>;
    processEffectiveResignations(today?: Date): Promise<{
        processed: number;
    }>;
}
