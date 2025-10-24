import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';
import { AuditAction } from '../database/entities/audit-log.entity';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('entityType') entityType?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.auditLogService.getLogs(start, end, userId, action, entityType);
  }

  @Get('entity/:entityType/:entityId')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Get audit logs for a specific entity' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getLogsByEntity(
    @Query('entityType') entityType: string,
    @Query('entityId') entityId: string,
  ) {
    return this.auditLogService.getLogsByEntity(entityType, entityId);
  }
}
