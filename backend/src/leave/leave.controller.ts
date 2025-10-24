import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BadRequestException } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Leave Requests')
@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('request')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Create a leave request' })
  @ApiResponse({ status: 201, description: 'Leave request created successfully' })
  async createLeaveRequest(@Request() req, @Body() createLeaveRequestDto: any) {
    // If the logged-in user has an employee, use it. Otherwise allow HR/Manager/Admin to submit on behalf via body.employeeId
    const employeeIdFromToken = req.user.employeeId;
    const employeeIdFromBody = createLeaveRequestDto.employeeId;

    const canActOnBehalf = [RoleName.ADMIN, RoleName.HR, RoleName.MANAGER].includes(req.user.role);
    const employeeId = employeeIdFromToken || (canActOnBehalf ? employeeIdFromBody : undefined);

    if (!employeeId) {
      throw new BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
    }
    return this.leaveService.createLeaveRequest(employeeId, createLeaveRequestDto);
  }

  @Get()
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get all leave requests' })
  @ApiResponse({ status: 200, description: 'Leave requests retrieved successfully' })
  async findAll() {
    return this.leaveService.findAll();
  }

  @Get('my-requests')
  @Roles(RoleName.EMPLOYEE, RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get my leave requests' })
  @ApiResponse({ status: 200, description: 'Leave requests retrieved successfully' })
  async getMyLeaveRequests(@Request() req, @Query('employeeId') employeeIdQuery?: string) {
    const canActOnBehalf = [RoleName.ADMIN, RoleName.HR, RoleName.MANAGER].includes(req.user.role);
    const employeeId = req.user.employeeId || (canActOnBehalf ? employeeIdQuery : undefined);
    if (!employeeId) {
      // For admin/HR/manager without employeeId, return empty list instead of 500
      return [];
    }
    return this.leaveService.findByEmployee(employeeId);
  }

  @Get(':id')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Get leave request by ID' })
  @ApiResponse({ status: 200, description: 'Leave request retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Leave request not found' })
  async findOne(@Param('id') id: string) {
    return this.leaveService.findOne(id);
  }

  @Post(':id/approve')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Approve a leave request' })
  @ApiResponse({ status: 200, description: 'Leave request approved successfully' })
  async approveLeaveRequest(@Param('id') id: string, @Request() req) {
    return this.leaveService.approveLeaveRequest(id, req.user.id);
  }

  @Post(':id/reject')
  @Roles(RoleName.MANAGER, RoleName.HR, RoleName.ADMIN)
  @ApiOperation({ summary: 'Reject a leave request' })
  @ApiResponse({ status: 200, description: 'Leave request rejected successfully' })
  async rejectLeaveRequest(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @Request() req,
  ) {
    return this.leaveService.rejectLeaveRequest(id, req.user.id, rejectionReason);
  }
}
