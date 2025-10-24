import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from '../database/entities/audit-log.entity';
export declare class AuditLogService {
    private auditLogRepository;
    constructor(auditLogRepository: Repository<AuditLog>);
    createLog(logData: {
        userId?: string;
        userEmail?: string;
        action: AuditAction;
        entityType?: string;
        entityId?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
        description?: string;
    }): Promise<AuditLog>;
    getLogs(startDate?: Date, endDate?: Date, userId?: string, action?: AuditAction, entityType?: string): Promise<AuditLog[]>;
    getLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}
