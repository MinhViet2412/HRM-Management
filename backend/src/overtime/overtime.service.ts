import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OvertimeRequest, OvertimeStatus } from '../database/entities/overtime-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';

@Injectable()
export class OvertimeService {
  constructor(
    @InjectRepository(OvertimeRequest)
    private readonly overtimeRepo: Repository<OvertimeRequest>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async create(employeeUserId: string, employeeId: string, dto: CreateOvertimeDto) {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) throw new NotFoundException('Employee not found');

    const hours = this.computeHours(dto.startTime, dto.endTime);
    if (hours <= 0) throw new BadRequestException('Invalid OT duration');

    const request = this.overtimeRepo.create({
      employeeId,
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      hours,
      reason: dto.reason || null,
      status: OvertimeStatus.PENDING,
      approverId: dto.approverId || null,
    });
    return this.overtimeRepo.save(request);
  }

  async listMy(employeeId: string) {
    return this.overtimeRepo.find({ where: { employeeId }, order: { date: 'DESC' } });
  }

  async listAssigned(approverId: string) {
    // Show requests explicitly assigned to approver OR unassigned pending requests
    return this.overtimeRepo.find({
      where: [
        { approverId },
        { approverId: null, status: OvertimeStatus.PENDING },
      ],
      order: { createdAt: 'DESC' },
    })
  }

  async assignApprover(id: string, approverId: string) {
    const req = await this.overtimeRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('OT request not found');
    if (req.status !== OvertimeStatus.PENDING) throw new BadRequestException('Only pending can be assigned');
    req.approverId = approverId;
    return this.overtimeRepo.save(req);
  }

  async approve(id: string, approverId: string, dto: ApproveOvertimeDto) {
    const req = await this.overtimeRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('OT request not found');
    if (req.status !== OvertimeStatus.PENDING) throw new BadRequestException('Request not pending');
    if (req.approverId && req.approverId !== approverId)
      throw new BadRequestException('Not assigned to this approver');
    req.status = OvertimeStatus.APPROVED;
    req.approverId = approverId;
    req.approvedAt = new Date();
    return this.overtimeRepo.save(req);
  }

  async reject(id: string, approverId: string, reason?: string) {
    const req = await this.overtimeRepo.findOne({ where: { id } });
    if (!req) throw new NotFoundException('OT request not found');
    if (req.status !== OvertimeStatus.PENDING) throw new BadRequestException('Request not pending');
    if (req.approverId && req.approverId !== approverId)
      throw new BadRequestException('Not assigned to this approver');
    req.status = OvertimeStatus.REJECTED;
    req.approverId = approverId;
    req.rejectionReason = reason || null;
    req.approvedAt = new Date();
    return this.overtimeRepo.save(req);
  }

  private computeHours(start: string, end: string): number {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = endMin - startMin;
    return Math.round((diff / 60) * 100) / 100;
  }
}


