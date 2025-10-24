import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';
import { Response } from 'express';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('attendance-summary')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get attendance summary report' })
  @ApiResponse({ status: 200, description: 'Attendance summary retrieved successfully' })
  async getAttendanceSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.reportsService.getAttendanceSummary(
      new Date(startDate),
      new Date(endDate),
      departmentId,
    );
  }

  @Get('staffing-by-department')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get staffing report by department' })
  @ApiResponse({ status: 200, description: 'Staffing report retrieved successfully' })
  async getStaffingByDepartment() {
    return this.reportsService.getStaffingByDepartment();
  }

  @Get('payroll-summary')
  @Roles(RoleName.HR, RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get payroll summary report' })
  @ApiResponse({ status: 200, description: 'Payroll summary retrieved successfully' })
  async getPayrollSummary(@Query('period') period: string) {
    return this.reportsService.getPayrollSummary(period);
  }

  @Get('employee-performance/:employeeId')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get employee performance report' })
  @ApiResponse({ status: 200, description: 'Employee performance report retrieved successfully' })
  async getEmployeePerformance(
    @Query('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getEmployeePerformance(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('personnel-turnover')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get personnel turnover report' })
  @ApiResponse({ status: 200, description: 'Personnel turnover report retrieved successfully' })
  async getPersonnelTurnover(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('departmentId') departmentId?: string,
  ) {
    return this.reportsService.getPersonnelTurnover(
      new Date(startDate),
      new Date(endDate),
      departmentId,
    );
  }

  @Get('export/attendance-summary')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Export attendance summary to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="attendance-summary.xlsx"')
  async exportAttendanceSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
    @Query('departmentId') departmentId?: string,
  ) {
    const buffer = await this.reportsService.exportAttendanceSummaryToExcel(
      new Date(startDate),
      new Date(endDate),
      departmentId,
    );
    
    const filename = `attendance-summary-${startDate}-to-${endDate}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('export/payroll-summary')
  @Roles(RoleName.HR, RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Export payroll summary to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="payroll-summary.xlsx"')
  async exportPayrollSummary(
    @Query('period') period: string,
    @Res() res: Response,
  ) {
    const buffer = await this.reportsService.exportPayrollSummaryToExcel(period);
    
    const filename = `payroll-summary-${period}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('export/personnel-turnover')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Export personnel turnover to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="personnel-turnover.xlsx"')
  async exportPersonnelTurnover(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
    @Query('departmentId') departmentId?: string,
  ) {
    const buffer = await this.reportsService.exportPersonnelTurnoverToExcel(
      new Date(startDate),
      new Date(endDate),
      departmentId,
    );
    
    const filename = `personnel-turnover-${startDate}-to-${endDate}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get('export/staffing-by-department')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Export staffing by department to Excel' })
  @ApiResponse({ status: 200, description: 'Excel file generated successfully' })
  @Header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @Header('Content-Disposition', 'attachment; filename="staffing-by-department.xlsx"')
  async exportStaffingByDepartment(@Res() res: Response) {
    const buffer = await this.reportsService.exportStaffingByDepartmentToExcel();
    
    const filename = `staffing-by-department-${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
