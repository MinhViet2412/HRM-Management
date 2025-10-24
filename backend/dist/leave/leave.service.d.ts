import { Repository } from 'typeorm';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';
export declare class LeaveService {
    private leaveRequestRepository;
    private employeeRepository;
    constructor(leaveRequestRepository: Repository<LeaveRequest>, employeeRepository: Repository<Employee>);
    createLeaveRequest(employeeId: string, createLeaveRequestDto: any): Promise<LeaveRequest>;
    findAll(): Promise<LeaveRequest[]>;
    findByEmployee(employeeId: string): Promise<LeaveRequest[]>;
    findOne(id: string): Promise<LeaveRequest>;
    approveLeaveRequest(id: string, approvedBy: string): Promise<LeaveRequest>;
    rejectLeaveRequest(id: string, approvedBy: string, rejectionReason: string): Promise<LeaveRequest>;
    getLeaveRequestsByDateRange(startDate: Date, endDate: Date): Promise<LeaveRequest[]>;
}
