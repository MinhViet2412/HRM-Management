import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dependent } from '../database/entities/dependent.entity';
import { Employee } from '../database/entities/employee.entity';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { TaxConfigService } from '../tax-config/tax-config.service';

@Injectable()
export class DependentsService {
  constructor(
    @InjectRepository(Dependent)
    private dependentRepository: Repository<Dependent>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private taxConfigService: TaxConfigService,
  ) {}

  async create(createDependentDto: CreateDependentDto): Promise<Dependent> {
    // Verify employee exists
    const employee = await this.employeeRepository.findOne({
      where: { id: createDependentDto.employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    // Lấy giá trị giảm trừ mặc định từ config nếu không được cung cấp
    const defaultDeductionAmount = createDependentDto.deductionAmount 
      ?? await this.taxConfigService.getDependentDeductionAmount();

    const dependent = this.dependentRepository.create({
      ...createDependentDto,
      dateOfBirth: createDependentDto.dateOfBirth
        ? new Date(createDependentDto.dateOfBirth)
        : null,
      isActive: createDependentDto.isActive ?? true,
      deductionAmount: defaultDeductionAmount,
    });

    return this.dependentRepository.save(dependent);
  }

  async findAll(employeeId?: string): Promise<Dependent[]> {
    const query = this.dependentRepository.createQueryBuilder('dependent');

    if (employeeId) {
      query.where('dependent.employeeId = :employeeId', { employeeId });
    }

    return query
      .leftJoinAndSelect('dependent.employee', 'employee')
      .orderBy('dependent.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Dependent> {
    const dependent = await this.dependentRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!dependent) {
      throw new NotFoundException('Dependent not found');
    }

    return dependent;
  }

  async findByEmployeeId(employeeId: string): Promise<Dependent[]> {
    return this.dependentRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    id: string,
    updateDependentDto: UpdateDependentDto,
  ): Promise<Dependent> {
    const dependent = await this.findOne(id);

    // If updating employeeId, verify the new employee exists
    if (updateDependentDto.employeeId) {
      const employee = await this.employeeRepository.findOne({
        where: { id: updateDependentDto.employeeId },
      });

      if (!employee) {
        throw new NotFoundException('Employee not found');
      }
    }

    // Convert dateOfBirth string to Date if provided
    const updateData: any = { ...updateDependentDto };
    if (updateDependentDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateDependentDto.dateOfBirth);
    }

    Object.assign(dependent, updateData);
    return this.dependentRepository.save(dependent);
  }

  async remove(id: string): Promise<void> {
    const dependent = await this.findOne(id);
    await this.dependentRepository.remove(dependent);
  }

  async getActiveDependentsCount(employeeId: string): Promise<number> {
    return this.dependentRepository.count({
      where: { employeeId, isActive: true },
    });
  }
}

