import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResignationRequest, ResignationStatus } from '../database/entities/resignation-request.entity';
import { Employee, EmployeeStatus } from '../database/entities/employee.entity';
import { User, UserStatus } from '../database/entities/user.entity';

@Injectable()
export class ResignationsService {
  constructor(
    @InjectRepository(ResignationRequest) private resignationRepo: Repository<ResignationRequest>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async requestResignation(employeeId: string, requestedById: string, effectiveDate: string, reason?: string) {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } })
    if (!employee) throw new NotFoundException('Employee not found')
    if (new Date(effectiveDate) < new Date(new Date().toDateString())) {
      throw new BadRequestException('Effective date must be today or later')
    }
    const req = this.resignationRepo.create({ employeeId, requestedById, effectiveDate: new Date(effectiveDate), reason })
    return this.resignationRepo.save(req)
  }

  async approve(id: string, approverId: string) {
    const req = await this.resignationRepo.findOne({ where: { id } })
    if (!req) throw new NotFoundException('Resignation request not found')
    req.status = ResignationStatus.APPROVED
    req.approvedById = approverId
    req.approvedAt = new Date()
    return this.resignationRepo.save(req)
  }

  async reject(id: string, approverId: string) {
    const req = await this.resignationRepo.findOne({ where: { id } })
    if (!req) throw new NotFoundException('Resignation request not found')
    req.status = ResignationStatus.REJECTED
    req.approvedById = approverId
    req.approvedAt = new Date()
    return this.resignationRepo.save(req)
  }

  async list(status?: ResignationStatus) {
    return this.resignationRepo.find({ where: status ? { status } : {}, relations: ['employee'] })
  }

  // To be called by scheduler daily
  async processEffectiveResignations(today = new Date()) {
    const dateOnly = new Date(today.toDateString())
    const due = await this.resignationRepo.find({ where: { status: ResignationStatus.APPROVED }, relations: ['employee'] })
    const updated: string[] = []
    for (const req of due) {
      if (new Date(req.effectiveDate.toDateString()).getTime() <= dateOnly.getTime()) {
        const employee = await this.employeeRepo.findOne({ where: { id: req.employeeId }, relations: ['user'] })
        if (employee) {
          employee.status = EmployeeStatus.TERMINATED
          employee.terminationDate = dateOnly
          await this.employeeRepo.save(employee)
          if (employee.user) {
            employee.user.status = UserStatus.INACTIVE
            await this.userRepo.save(employee.user)
          }
        }
        req.status = ResignationStatus.PROCESSED
        await this.resignationRepo.save(req)
        updated.push(req.id)
      }
    }
    return { processed: updated.length }
  }
}


