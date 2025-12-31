import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InsuranceConfig, InsuranceType } from '../database/entities/insurance-config.entity';
import { CreateInsuranceConfigDto } from './dto/create-insurance-config.dto';
import { UpdateInsuranceConfigDto } from './dto/update-insurance-config.dto';

@Injectable()
export class InsuranceConfigService {
  constructor(
    @InjectRepository(InsuranceConfig)
    private insuranceConfigRepository: Repository<InsuranceConfig>,
  ) {}

  async create(createDto: CreateInsuranceConfigDto): Promise<InsuranceConfig> {
    // Check if type already exists
    const existing = await this.insuranceConfigRepository.findOne({
      where: { type: createDto.type },
    });

    if (existing) {
      throw new ConflictException(
        `Insurance config with type "${createDto.type}" already exists`,
      );
    }

    const config = this.insuranceConfigRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });

    return this.insuranceConfigRepository.save(config);
  }

  async findAll(): Promise<InsuranceConfig[]> {
    return this.insuranceConfigRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findActive(): Promise<InsuranceConfig[]> {
    return this.insuranceConfigRepository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<InsuranceConfig> {
    const config = await this.insuranceConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Insurance config not found');
    }

    return config;
  }

  async findByType(type: InsuranceType): Promise<InsuranceConfig> {
    const config = await this.insuranceConfigRepository.findOne({
      where: { type },
    });

    if (!config) {
      throw new NotFoundException(`Insurance config with type "${type}" not found`);
    }

    return config;
  }

  async update(
    id: string,
    updateDto: UpdateInsuranceConfigDto,
  ): Promise<InsuranceConfig> {
    const config = await this.findOne(id);

    // Check if updating type and it conflicts with existing
    if (updateDto.type && updateDto.type !== config.type) {
      const existing = await this.insuranceConfigRepository.findOne({
        where: { type: updateDto.type },
      });

      if (existing) {
        throw new ConflictException(
          `Insurance config with type "${updateDto.type}" already exists`,
        );
      }
    }

    Object.assign(config, updateDto);
    return this.insuranceConfigRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.insuranceConfigRepository.remove(config);
  }

  /**
   * Tính số tiền bảo hiểm cho nhân viên
   */
  async calculateEmployeeInsurance(
    salary: number,
    type: InsuranceType,
  ): Promise<number> {
    const config = await this.findByType(type);

    if (!config.isActive) {
      return 0;
    }

    const rate = config.employeeRate ?? config.insuranceRate;
    return (salary * rate) / 100;
  }

  /**
   * Tính số tiền bảo hiểm cho người sử dụng lao động
   */
  async calculateEmployerInsurance(
    salary: number,
    type: InsuranceType,
  ): Promise<number> {
    const config = await this.findByType(type);

    if (!config.isActive) {
      return 0;
    }

    const rate = config.employerRate ?? config.insuranceRate;
    return (salary * rate) / 100;
  }

  /**
   * Tính tổng số tiền bảo hiểm (nhân viên + người sử dụng lao động)
   */
  async calculateTotalInsurance(
    salary: number,
    type: InsuranceType,
  ): Promise<number> {
    const employeeAmount = await this.calculateEmployeeInsurance(salary, type);
    const employerAmount = await this.calculateEmployerInsurance(salary, type);
    return employeeAmount + employerAmount;
  }
}

