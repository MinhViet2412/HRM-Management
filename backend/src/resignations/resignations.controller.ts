import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResignationsService } from './resignations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';
import { ResignationStatus } from '../database/entities/resignation-request.entity';

@ApiTags('Resignations')
@Controller('resignations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ResignationsController {
  constructor(private readonly service: ResignationsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Employee/Manager submit resignation request' })
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER, RoleName.EMPLOYEE)
  async request(@Body() body: { employeeId: string; requestedById: string; effectiveDate: string; reason?: string }) {
    return this.service.requestResignation(body.employeeId, body.requestedById, body.effectiveDate, body.reason)
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve resignation request' })
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  async approve(@Param('id') id: string, @Body() body: { approverId: string }) {
    return this.service.approve(id, body.approverId)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject resignation request' })
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  async reject(@Param('id') id: string, @Body() body: { approverId: string }) {
    return this.service.reject(id, body.approverId)
  }

  @Get()
  @ApiOperation({ summary: 'List resignation requests' })
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  async list(@Query('status') status?: ResignationStatus) {
    return this.service.list(status)
  }
}


