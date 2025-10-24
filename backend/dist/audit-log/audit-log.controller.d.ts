import { AuditLogService } from './audit-log.service';
import { AuditAction } from '../database/entities/audit-log.entity';
export declare class AuditLogController {
    private readonly auditLogService;
    constructor(auditLogService: AuditLogService);
    getLogs(startDate?: string, endDate?: string, userId?: string, action?: AuditAction, entityType?: string): Promise<import("../database/entities/audit-log.entity").AuditLog[]>;
    getLogsByEntity(entityType: string, entityId: string): Promise<import("../database/entities/audit-log.entity").AuditLog[]>;
}
