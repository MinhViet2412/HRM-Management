import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdjustAttendanceDto } from './dto/adjust-attendance.dto';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Check in for the day' })
  @ApiResponse({ status: 201, description: 'Check-in successful' })
  @ApiResponse({ status: 409, description: 'Already checked in today' })
  async checkIn(@Request() req, @Body() checkInDto: CheckInDto & { employeeId?: string }) {
    const canActOnBehalf = [RoleName.ADMIN, RoleName.HR, RoleName.MANAGER].includes(req.user.role);
    const employeeId = req.user.employeeId || (canActOnBehalf ? checkInDto.employeeId : undefined);
    if (!employeeId) {
      throw new BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
    }
    return this.attendanceService.checkIn(employeeId, checkInDto);
  }

  @Post('check-out')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Check out for the day' })
  @ApiResponse({ status: 200, description: 'Check-out successful' })
  @ApiResponse({ status: 409, description: 'Already checked out today' })
  async checkOut(@Request() req, @Body() checkOutDto: CheckOutDto & { employeeId?: string }) {
    const canActOnBehalf = [RoleName.ADMIN, RoleName.HR, RoleName.MANAGER].includes(req.user.role);
    const employeeId = req.user.employeeId || (canActOnBehalf ? checkOutDto.employeeId : undefined);
    if (!employeeId) {
      throw new BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
    }
    return this.attendanceService.checkOut(employeeId, checkOutDto);
  }

  @Get('my-attendance')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get my attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getMyAttendance(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('employeeId') employeeIdQuery?: string,
  ) {
    const canActOnBehalf = [RoleName.ADMIN, RoleName.HR, RoleName.MANAGER].includes(req.user.role);
    const employeeId = req.user.employeeId || (canActOnBehalf ? employeeIdQuery : undefined);

    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    if (!employeeId) {
      // For non-employee accounts without provided employeeId, return empty list instead of error
      return [];
    }

    return this.attendanceService.getAttendanceByEmployee(employeeId, start, end);
  }

  @Get('employee/:employeeId')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get employee attendance records' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getEmployeeAttendance(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.attendanceService.getAttendanceByEmployee(employeeId, start, end);
  }

  @Get('date/:date')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get attendance records for a specific date' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  async getAttendanceByDate(@Param('date') date: string) {
    return this.attendanceService.getAttendanceByDate(new Date(date));
  }

  @Get()
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get attendance records with filters' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'departmentId', required: false, description: 'Department ID filter' })
  async getAttendanceWithFilters(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    // Parse dates properly to avoid timezone issues
    const start = startDate ? new Date(startDate + 'T00:00:00') : new Date();
    const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
    return this.attendanceService.getAttendanceWithFilters(start, end, departmentId);
  }

  @Post('close-missing-checkout/:employeeId/:date')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Close missing checkout for an employee' })
  @ApiResponse({ status: 200, description: 'Missing checkout closed successfully' })
  async closeMissingCheckout(
    @Param('employeeId') employeeId: string,
    @Param('date') date: string,
    @Request() req,
  ) {
    return this.attendanceService.closeMissingCheckout(
      employeeId,
      new Date(date),
      req.user.id,
    );
  }

  @Get('summary/:employeeId')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get attendance summary for an employee' })
  @ApiResponse({ status: 200, description: 'Attendance summary retrieved successfully' })
  @ApiQuery({ name: 'startDate', required: true, type: Date })
  @ApiQuery({ name: 'endDate', required: true, type: Date })
  async getAttendanceSummary(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getAttendanceSummary(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Patch('adjust/:attendanceId')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Adjust attendance times and status' })
  @ApiResponse({ status: 200, description: 'Attendance adjusted successfully' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  async adjustAttendance(
    @Param('attendanceId') attendanceId: string,
    @Body() adjustDto: AdjustAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.adjustAttendance(
      attendanceId,
      adjustDto,
      req.user.id,
    );
  }

  @Post('manual')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Create or update attendance manually for any date' })
  @ApiResponse({ status: 200, description: 'Attendance upserted successfully' })
  async manualUpsert(
    @Body() body: ManualAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.manualUpsert(body, req.user.id);
  }

  @Post('test-calculation')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Test working hours calculation' })
  @ApiResponse({ status: 200, description: 'Calculation test completed' })
  async testCalculation(
    @Body() testData: {
      checkIn: string;
      checkOut: string;
      shiftId: string;
    },
  ) {
    return this.attendanceService.testWorkingHoursCalculation(
      testData.checkIn,
      testData.checkOut,
      testData.shiftId,
    );
  }

  @Post('test-rules')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Test attendance rules evaluation' })
  @ApiResponse({ status: 200, description: 'Rules evaluation completed' })
  async testRules(
    @Body() testData: {
      checkIn?: string;
      checkOut?: string;
    },
  ) {
    return this.attendanceService.testAttendanceRules(
      testData.checkIn ? new Date(testData.checkIn) : null,
      testData.checkOut ? new Date(testData.checkOut) : null,
    );
  }

  @Get('rules')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get all attendance rules' })
  @ApiResponse({ status: 200, description: 'Rules retrieved successfully' })
  async getRules() {
    return this.attendanceService.getAllAttendanceRules();
  }

  @Post('re-evaluate')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Re-evaluate all attendance records with updated rules' })
  @ApiResponse({ status: 200, description: 'Re-evaluation completed' })
  async reEvaluateAttendance(
    @Body() filterData: {
      startDate?: string;
      endDate?: string;
      departmentId?: string;
    },
  ) {
    return this.attendanceService.reEvaluateAttendanceRecords(
      filterData.startDate ? new Date(filterData.startDate) : undefined,
      filterData.endDate ? new Date(filterData.endDate) : undefined,
      filterData.departmentId,
    );
  }
}
