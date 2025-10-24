import { ResignationsService } from './resignations.service';
import { ResignationStatus } from '../database/entities/resignation-request.entity';
export declare class ResignationsController {
    private readonly service;
    constructor(service: ResignationsService);
    request(body: {
        employeeId: string;
        requestedById: string;
        effectiveDate: string;
        reason?: string;
    }): Promise<import("../database/entities/resignation-request.entity").ResignationRequest>;
    approve(id: string, body: {
        approverId: string;
    }): Promise<import("../database/entities/resignation-request.entity").ResignationRequest>;
    reject(id: string, body: {
        approverId: string;
    }): Promise<import("../database/entities/resignation-request.entity").ResignationRequest>;
    list(status?: ResignationStatus): Promise<import("../database/entities/resignation-request.entity").ResignationRequest[]>;
}
