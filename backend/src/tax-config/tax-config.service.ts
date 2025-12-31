import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxConfig } from '../database/entities/tax-config.entity';
import { UpdateTaxConfigDto, UpdateDependentDeductionDto } from './dto/update-tax-config.dto';

@Injectable()
export class TaxConfigService {
  private readonly DEPENDENT_DEDUCTION_KEY = 'dependent_deduction_amount';
  private readonly DEFAULT_DEDUCTION_AMOUNT = 4400000;

  constructor(
    @InjectRepository(TaxConfig)
    private taxConfigRepository: Repository<TaxConfig>,
  ) {}

  /**
   * Lấy giá trị giảm trừ người phụ thuộc mặc định
   */
  async getDependentDeductionAmount(): Promise<number> {
    const config = await this.taxConfigRepository.findOne({
      where: { key: this.DEPENDENT_DEDUCTION_KEY },
    });

    if (!config) {
      // Nếu chưa có config, tạo mới với giá trị mặc định
      const newConfig = this.taxConfigRepository.create({
        key: this.DEPENDENT_DEDUCTION_KEY,
        value: this.DEFAULT_DEDUCTION_AMOUNT.toString(),
        description: 'Giá trị giảm trừ thuế cho mỗi người phụ thuộc (VNĐ)',
      });
      await this.taxConfigRepository.save(newConfig);
      return this.DEFAULT_DEDUCTION_AMOUNT;
    }

    return parseFloat(config.value) || this.DEFAULT_DEDUCTION_AMOUNT;
  }

  /**
   * Cập nhật giá trị giảm trừ người phụ thuộc
   */
  async updateDependentDeductionAmount(
    dto: UpdateDependentDeductionDto,
  ): Promise<TaxConfig> {
    let config = await this.taxConfigRepository.findOne({
      where: { key: this.DEPENDENT_DEDUCTION_KEY },
    });

    if (!config) {
      config = this.taxConfigRepository.create({
        key: this.DEPENDENT_DEDUCTION_KEY,
        value: dto.amount.toString(),
        description: 'Giá trị giảm trừ thuế cho mỗi người phụ thuộc (VNĐ)',
      });
    } else {
      config.value = dto.amount.toString();
    }

    return this.taxConfigRepository.save(config);
  }

  /**
   * Lấy tất cả cấu hình thuế
   */
  async findAll(): Promise<TaxConfig[]> {
    return this.taxConfigRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Lấy cấu hình theo key
   */
  async findByKey(key: string): Promise<TaxConfig> {
    const config = await this.taxConfigRepository.findOne({
      where: { key },
    });

    if (!config) {
      throw new NotFoundException(`Tax config with key "${key}" not found`);
    }

    return config;
  }

  /**
   * Cập nhật cấu hình
   */
  async update(
    key: string,
    updateDto: UpdateTaxConfigDto,
  ): Promise<TaxConfig> {
    const config = await this.findByKey(key);

    if (updateDto.value !== undefined) {
      config.value = updateDto.value;
    }

    if (updateDto.description !== undefined) {
      config.description = updateDto.description;
    }

    return this.taxConfigRepository.save(config);
  }
}

