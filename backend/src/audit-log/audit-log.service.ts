import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditAction } from '../database/entities/audit-log.entity';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async createLog(logData: {
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
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(logData);
    return this.auditLogRepository.save(auditLog);
  }

  async getLogs(
    startDate?: Date,
    endDate?: Date,
    userId?: string,
    action?: AuditAction,
    entityType?: string,
  ): Promise<AuditLog[]> {
    const query: any = {};

    if (startDate && endDate) {
      query.createdAt = Between(startDate, endDate);
    }

    if (userId) {
      query.userId = userId;
    }

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    return this.auditLogRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async getLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
    });
  }
}
