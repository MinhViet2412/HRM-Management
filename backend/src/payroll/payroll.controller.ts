import { Controller, Get, Post, Param, UseGuards, Request, Query, Res, BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('generate/:period')
  @Roles(RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Generate payroll for a period' })
  @ApiResponse({ status: 201, description: 'Payroll generated successfully' })
  async generatePayroll(@Param('period') period: string, @Query('employeeId') employeeId?: string) {
    // Validate period format YYYY-MM to avoid 400s from downstream and ensure consistent JSON error
    if (!/^\d{4}-\d{2}$/.test(period)) {
      throw new BadRequestException('Invalid period format. Expected YYYY-MM')
    }
    try {
      return await this.payrollService.generatePayroll(period, employeeId);
    } catch (e: any) {
      // Normalize any thrown errors to BadRequest with message
      throw new BadRequestException(e?.message || 'Failed to generate payroll');
    }
  }

  @Get('employee/:employeeId')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get payroll records for an employee' })
  @ApiResponse({ status: 200, description: 'Payroll records retrieved successfully' })
  async getPayrollByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('period') period?: string,
  ) {
    return this.payrollService.getPayrollByEmployee(employeeId, period);
  }

  @Get('period/:period')
  @Roles(RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get payroll records for a period' })
  @ApiResponse({ status: 200, description: 'Payroll records retrieved successfully' })
  async getPayrollByPeriod(@Param('period') period: string) {
    return this.payrollService.getPayrollByPeriod(period);
  }

  @Get(':id/pdf')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Download payroll as PDF' })
  @ApiResponse({ status: 200, description: 'PDF generated' })
  async downloadPayrollPdf(@Param('id') id: string, @Res() res: Response, @Request() req) {
    const { stream, filename } = await this.payrollService.generatePayrollPdf(id, req.user);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    stream.pipe(res);
  }

  @Post(':id/approve')
  @Roles(RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Approve a payroll' })
  @ApiResponse({ status: 200, description: 'Payroll approved successfully' })
  async approvePayroll(@Param('id') id: string, @Request() req) {
    return this.payrollService.approvePayroll(id, req.user.id);
  }

  @Get('standard-hours')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get standard working days/hours for a period YYYY-MM' })
  async getStandardHours(@Query('period') period: string) {
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const days = (this as any).payrollService['getWorkingDaysInMonth'](date);
    return { period, standardWorkingDays: days, standardWorkingHours: days * 8 };
  }
}
