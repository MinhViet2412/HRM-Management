import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveLimitConfig } from '../database/entities/leave-limit-config.entity';
import { LeaveType } from '../database/entities/leave-request.entity';
import { CreateLeaveLimitConfigDto } from './dto/create-leave-limit-config.dto';
import { UpdateLeaveLimitConfigDto } from './dto/update-leave-limit-config.dto';

@Injectable()
export class LeaveLimitConfigService {
  constructor(
    @InjectRepository(LeaveLimitConfig)
    private leaveLimitConfigRepository: Repository<LeaveLimitConfig>,
  ) {}

  async create(createDto: CreateLeaveLimitConfigDto): Promise<LeaveLimitConfig> {
    const existing = await this.leaveLimitConfigRepository.findOne({
      where: { leaveType: createDto.leaveType, year: createDto.year },
    });

    if (existing) {
      throw new ConflictException(
        `Leave limit config for type "${createDto.leaveType}" and year ${createDto.year} already exists`,
      );
    }

    const config = this.leaveLimitConfigRepository.create({
      ...createDto,
      isActive: createDto.isActive ?? true,
    });

    return this.leaveLimitConfigRepository.save(config);
  }

  async findAll(): Promise<LeaveLimitConfig[]> {
    return this.leaveLimitConfigRepository.find({
      order: { year: 'DESC', leaveType: 'ASC' },
    });
  }

  async findByYear(year: number): Promise<LeaveLimitConfig[]> {
    return this.leaveLimitConfigRepository.find({
      where: { year, isActive: true },
      order: { leaveType: 'ASC' },
    });
  }

  async findByTypeAndYear(
    leaveType: LeaveType,
    year: number,
  ): Promise<LeaveLimitConfig | null> {
    return this.leaveLimitConfigRepository.findOne({
      where: { leaveType, year, isActive: true },
    });
  }

  async findOne(id: string): Promise<LeaveLimitConfig> {
    const config = await this.leaveLimitConfigRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Leave limit config not found');
    }

    return config;
  }

  async update(
    id: string,
    updateDto: UpdateLeaveLimitConfigDto,
  ): Promise<LeaveLimitConfig> {
    const config = await this.findOne(id);

    // Check for conflicts if updating leaveType or year
    if (
      (updateDto.leaveType && updateDto.leaveType !== config.leaveType) ||
      (updateDto.year && updateDto.year !== config.year)
    ) {
      const existing = await this.leaveLimitConfigRepository.findOne({
        where: {
          leaveType: updateDto.leaveType ?? config.leaveType,
          year: updateDto.year ?? config.year,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Leave limit config for type "${updateDto.leaveType ?? config.leaveType}" and year ${updateDto.year ?? config.year} already exists`,
        );
      }
    }

    Object.assign(config, updateDto);
    return this.leaveLimitConfigRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.leaveLimitConfigRepository.remove(config);
  }

  /**
   * Get max days for a leave type in a specific year
   * Returns null if no limit is configured
   */
  async getMaxDays(leaveType: LeaveType, year: number): Promise<number | null> {
    const config = await this.findByTypeAndYear(leaveType, year);
    return config ? Number(config.maxDays) : null;
  }
}

