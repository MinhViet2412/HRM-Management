import { Controller, Get, Post, Param, Body, Query, UseGuards, Delete, Patch, Request as Req } from '@nestjs/common';
import { PayslipsService } from './payslips.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@Controller('payslips')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PayslipsController {
  constructor(private readonly payslipsService: PayslipsService) {}

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  list(@Query('period') period: string) {
    return this.payslipsService.list(period);
  }

  @Get('me')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  listMine(@Req() req, @Query('period') period: string) {
    const employeeId = req.user.employeeId;
    if (!employeeId) return [];
    return this.payslipsService.listByEmployee(employeeId, period);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER, RoleName.EMPLOYEE)
  get(@Param('id') id: string) {
    return this.payslipsService.get(id);
  }

  @Post('bulk-create/:period')
  @Roles(RoleName.ADMIN, RoleName.HR)
  bulkCreate(@Param('period') period: string, @Body('employeeIds') employeeIds?: string[]) {
    return this.payslipsService.bulkCreate(period, employeeIds);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  remove(@Param('id') id: string) {
    return this.payslipsService.remove(id);
  }

  @Patch(':id/status')
  @Roles(RoleName.ADMIN, RoleName.HR)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.payslipsService.updateStatus(id, status as any);
  }
}


