import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { LeaveRequest, LeaveType, LeaveStatus } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(LeaveRequest)
    private leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async createLeaveRequest(employeeId: string, createLeaveRequestDto: any): Promise<LeaveRequest> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
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

    const days = Number(leaveRequest.days)
    if (leaveRequest.type === LeaveType.ANNUAL) {
      if (Number(employee.annualLeaveBalance || 0) < days) {
        throw new BadRequestException('Not enough annual leave balance');
      }
      employee.annualLeaveBalance = Number(employee.annualLeaveBalance || 0) - days
    } else if (leaveRequest.type === LeaveType.SICK) {
      if (Number(employee.sickLeaveBalance || 0) < days) {
        throw new BadRequestException('Not enough sick leave balance');
      }
      employee.sickLeaveBalance = Number(employee.sickLeaveBalance || 0) - days
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
