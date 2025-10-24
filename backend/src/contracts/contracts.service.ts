import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from '../database/entities/contract.entity';
import { ContractTemplate } from '../database/entities/contract-template.entity';
import { RoleName } from '../database/entities/role.entity';
import { Employee } from '../database/entities/employee.entity';
import { ContractTypesService } from '../contract-types/contract-types.service';
import {
  CreateContractDto,
  UpdateContractDto,
  CreateContractTemplateDto,
  UpdateContractTemplateDto,
} from './dto';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepo: Repository<Contract>,
    @InjectRepository(ContractTemplate)
    private readonly contractTemplateRepo: Repository<ContractTemplate>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    private readonly contractTypesService: ContractTypesService,
  ) {}

  // Contracts
  async createContract(dto: CreateContractDto) {
    const contract = this.contractRepo.create(dto as unknown as Contract);
    return this.contractRepo.save(contract);
  }

  async getContracts(currentUser?: { role: RoleName; employeeId?: string; departmentId?: string }) {
    // Admin: full access
    if (currentUser?.role === RoleName.ADMIN) {
      return this.contractRepo.find({ relations: ['type'] });
    }

    // Manager: only contracts of employees in their department
    if (currentUser?.role === RoleName.MANAGER && currentUser.departmentId) {
      const employees = await this.employeeRepo.find({ where: { departmentId: currentUser.departmentId } });
      const employeeIds = employees.map((e) => e.id);
      return this.contractRepo.find({ where: employeeIds.length ? employeeIds.map(id => ({ employeeId: id })) as any : {}, relations: ['type'] });
    }

    // Employee: only own contracts
    if (currentUser?.role === RoleName.EMPLOYEE && currentUser.employeeId) {
      return this.contractRepo.find({ where: { employeeId: currentUser.employeeId }, relations: ['type'] });
    }

    return [];
  }

  async getContract(id: string, currentUser?: { role: RoleName; employeeId?: string; departmentId?: string }) {
    const contract = await this.contractRepo.findOne({ where: { id }, relations: ['type'] });
    if (!contract) throw new NotFoundException('Contract not found');
    if (currentUser?.role === RoleName.ADMIN) return contract;
    if (currentUser?.role === RoleName.EMPLOYEE && currentUser.employeeId === contract.employeeId) return contract;
    if (currentUser?.role === RoleName.MANAGER && currentUser.departmentId) {
      const employee = await this.employeeRepo.findOne({ where: { id: contract.employeeId } });
      if (employee?.departmentId === currentUser.departmentId) return contract;
    }
    throw new ForbiddenException('Access denied');
  }

  async updateContract(id: string, dto: UpdateContractDto) {
    await this.contractRepo.update(id, dto as unknown as Contract);
    return this.getContract(id);
  }

  async deleteContract(id: string) {
    await this.contractRepo.delete(id);
    return { success: true };
  }

  async approveContract(id: string) {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    contract.status = ContractStatus.ACTIVE;
    await this.contractRepo.save(contract);
    return contract;
  }

  async rejectContract(id: string, reason?: string) {
    const contract = await this.contractRepo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Contract not found');
    contract.status = ContractStatus.TERMINATED;
    if (reason) {
      contract.notes = contract.notes ? `${contract.notes}\n[REJECT]: ${reason}` : `[REJECT]: ${reason}`;
    }
    await this.contractRepo.save(contract);
    return contract;
  }

  // Contract Templates
  async createTemplate(dto: CreateContractTemplateDto) {
    const entity = this.contractTemplateRepo.create(dto as unknown as ContractTemplate);
    return this.contractTemplateRepo.save(entity);
  }

  async getTemplates() {
    return this.contractTemplateRepo.find({ relations: ['type'] });
  }

  async updateTemplate(id: string, dto: UpdateContractTemplateDto) {
    await this.contractTemplateRepo.update(id, dto as unknown as ContractTemplate);
    return this.contractTemplateRepo.findOne({ where: { id }, relations: ['type'] });
  }

  async deleteTemplate(id: string) {
    await this.contractTemplateRepo.delete(id);
    return { success: true };
  }
}


