import { LeaveService } from './leave.service';
export declare class LeaveController {
    private readonly leaveService;
    constructor(leaveService: LeaveService);
    createLeaveRequest(req: any, createLeaveRequestDto: any): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
    findAll(): Promise<import("../database/entities/leave-request.entity").LeaveRequest[]>;
    getMyLeaveRequests(req: any, employeeIdQuery?: string): Promise<import("../database/entities/leave-request.entity").LeaveRequest[]>;
    findOne(id: string): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
    approveLeaveRequest(id: string, req: any): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
    rejectLeaveRequest(id: string, rejectionReason: string, req: any): Promise<import("../database/entities/leave-request.entity").LeaveRequest>;
}
