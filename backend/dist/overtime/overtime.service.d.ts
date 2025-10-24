import { Repository } from 'typeorm';
import { OvertimeRequest } from '../database/entities/overtime-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';
export declare class OvertimeService {
    private readonly overtimeRepo;
    private readonly employeeRepo;
    constructor(overtimeRepo: Repository<OvertimeRequest>, employeeRepo: Repository<Employee>);
    create(employeeUserId: string, employeeId: string, dto: CreateOvertimeDto): Promise<OvertimeRequest>;
    listMy(employeeId: string): Promise<OvertimeRequest[]>;
    listAssigned(approverId: string): Promise<OvertimeRequest[]>;
    assignApprover(id: string, approverId: string): Promise<OvertimeRequest>;
    approve(id: string, approverId: string, dto: ApproveOvertimeDto): Promise<OvertimeRequest>;
    reject(id: string, approverId: string, reason?: string): Promise<OvertimeRequest>;
    private computeHours;
}
