import { OvertimeService } from './overtime.service';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';
export declare class OvertimeController {
    private readonly overtimeService;
    constructor(overtimeService: OvertimeService);
    create(dto: CreateOvertimeDto, req: any): Promise<import("../database/entities/overtime-request.entity").OvertimeRequest>;
    listMy(req: any): Promise<import("../database/entities/overtime-request.entity").OvertimeRequest[]>;
    listAssigned(req: any): Promise<import("../database/entities/overtime-request.entity").OvertimeRequest[]>;
    approve(id: string, dto: ApproveOvertimeDto, req: any): Promise<import("../database/entities/overtime-request.entity").OvertimeRequest>;
    reject(id: string, reason: string, req: any): Promise<import("../database/entities/overtime-request.entity").OvertimeRequest>;
}
