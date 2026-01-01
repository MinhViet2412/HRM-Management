import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest, LeaveType, LeaveStatus } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { LeaveLimitConfigService } from '../leave-limit-config/leave-limit-config.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private leaveLimitConfigService: LeaveLimitConfigService,
  ) {}

  async createLeaveRequest(employeeId: string, createLeaveRequestDto: any): Promise<LeaveRequest> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Validate leave type - only allow 4 types: annual, sick, maternity, unpaid
    const allowedTypes = [LeaveType.ANNUAL, LeaveType.SICK, LeaveType.MATERNITY, LeaveType.UNPAID];
    if (!allowedTypes.includes(createLeaveRequestDto.type)) {
      throw new BadRequestException(
        `Invalid leave type. Allowed types are: ${allowedTypes.join(', ')}`
      );
    }

    // Normalize to date-only (00:00)
    const startDate = new Date(new Date(createLeaveRequestDto.startDate).toDateString());
    const endDate = new Date(new Date(createLeaveRequestDto.endDate).toDateString());

    if (endDate < startDate) {
      throw new BadRequestException('End date must be the same or after start date');
    }

    const today = new Date(new Date().toDateString());
    if (startDate < today) {
      throw new BadRequestException('Cannot request leave for past dates');
    }

    // Calculate days
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Check leave limit for the year
    const year = startDate.getFullYear();
    const maxDays = await this.leaveLimitConfigService.getMaxDays(
      createLeaveRequestDto.type,
      year,
    );

    if (maxDays !== null) {
      // Get total approved leave days for this type in this year
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      const existingLeaves = await this.leaveRequestRepository.find({
        where: {
          employeeId,
          type: createLeaveRequestDto.type,
          status: LeaveStatus.APPROVED,
          startDate: Between(yearStart, yearEnd),
        },
      });

      const totalUsedDays = existingLeaves.reduce(
        (sum, leave) => sum + Number(leave.days || 0),
        0,
      );

      // If employee has already used all or more than the limit, don't allow creating new leave request
      if (totalUsedDays >= maxDays) {
        throw new BadRequestException(
          `Cannot create leave request. You have already reached the maximum limit of ${maxDays} days for ${createLeaveRequestDto.type} leave in ${year}. Already used: ${totalUsedDays} days.`,
        );
      }

      // If adding this request would exceed the limit, don't allow
      if (totalUsedDays + days > maxDays) {
        throw new BadRequestException(
          `Cannot create leave request. This would exceed the leave limit. Maximum ${maxDays} days allowed for ${createLeaveRequestDto.type} leave in ${year}. Already used: ${totalUsedDays} days. Requested: ${days} days.`,
        );
      }
    }

    const leaveRequest = this.leaveRequestRepository.create({
      employeeId,
      type: createLeaveRequestDto.type,
      startDate,
      endDate,
      days,
      reason: createLeaveRequestDto.reason,
      notes: createLeaveRequestDto.notes,
    });

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async findAll(): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: { employeeId },
      relations: ['employee'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const leaveRequest = await this.leaveRequestRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!leaveRequest) {
      throw new NotFoundException('Leave request not found');
    }

    return leaveRequest;
  }

  async approveLeaveRequest(id: string, approvedBy: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    // Deduct balance based on type
    const employee = await this.employeeRepository.findOne({ where: { id: leaveRequest.employeeId } })
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const days = Number(leaveRequest.days);
    const year = leaveRequest.startDate.getFullYear();

    // Check leave limit for the year
    const maxDays = await this.leaveLimitConfigService.getMaxDays(
      leaveRequest.type,
      year,
    );

    if (maxDays !== null) {
      // Get total approved leave days for this type in this year (excluding current request)
      const yearStart = new Date(year, 0, 1);
      const yearEnd = new Date(year, 11, 31);
      const existingLeaves = await this.leaveRequestRepository.find({
        where: {
          employeeId: leaveRequest.employeeId,
          type: leaveRequest.type,
          status: LeaveStatus.APPROVED,
          startDate: Between(yearStart, yearEnd),
        },
      });

      const totalUsedDays = existingLeaves.reduce(
        (sum, leave) => sum + Number(leave.days || 0),
        0,
      );

      // If employee has already reached the limit, don't allow approving
      if (totalUsedDays >= maxDays) {
        throw new BadRequestException(
          `Cannot approve: Employee has already reached the maximum limit of ${maxDays} days for ${leaveRequest.type} leave in ${year}. Already used: ${totalUsedDays} days.`,
        );
      }

      // If approving this request would exceed the limit, don't allow
      if (totalUsedDays + days > maxDays) {
        throw new BadRequestException(
          `Cannot approve: This would exceed the leave limit. Maximum ${maxDays} days allowed for ${leaveRequest.type} leave in ${year}. Already used: ${totalUsedDays} days. Requested: ${days} days.`,
        );
      }
    }

    // Deduct balance based on type (for annual and sick leave)
    if (leaveRequest.type === LeaveType.ANNUAL) {
      if (Number(employee.annualLeaveBalance || 0) < days) {
        throw new BadRequestException('Not enough annual leave balance');
      }
      employee.annualLeaveBalance = Number(employee.annualLeaveBalance || 0) - days;
    } else if (leaveRequest.type === LeaveType.SICK) {
      if (Number(employee.sickLeaveBalance || 0) < days) {
        throw new BadRequestException('Not enough sick leave balance');
      }
      employee.sickLeaveBalance = Number(employee.sickLeaveBalance || 0) - days;
    }

    leaveRequest.status = LeaveStatus.APPROVED;
    leaveRequest.approvedBy = approvedBy;
    leaveRequest.approvedAt = new Date();

    await this.employeeRepository.save(employee)
    return this.leaveRequestRepository.save(leaveRequest);
  }

  async rejectLeaveRequest(id: string, approvedBy: string, rejectionReason: string): Promise<LeaveRequest> {
    const leaveRequest = await this.findOne(id);

    if (leaveRequest.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Leave request is not pending');
    }

    leaveRequest.status = LeaveStatus.REJECTED;
    leaveRequest.approvedBy = approvedBy;
    leaveRequest.approvedAt = new Date();
    leaveRequest.rejectionReason = rejectionReason;

    return this.leaveRequestRepository.save(leaveRequest);
  }

  async getLeaveRequestsByDateRange(startDate: Date, endDate: Date): Promise<LeaveRequest[]> {
    return this.leaveRequestRepository.find({
      where: {
        startDate: Between(startDate, endDate),
        status: LeaveStatus.APPROVED,
      },
      relations: ['employee'],
    });
  }
}
