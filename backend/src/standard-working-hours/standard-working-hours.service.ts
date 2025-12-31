import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardWorkingHours } from '../database/entities/standard-working-hours.entity';
import { CreateStandardWorkingHoursDto } from './dto/create-standard-working-hours.dto';
import { UpdateStandardWorkingHoursDto } from './dto/update-standard-working-hours.dto';

@Injectable()
export class StandardWorkingHoursService {
  constructor(
    @InjectRepository(StandardWorkingHours)
    private standardWorkingHoursRepository: Repository<StandardWorkingHours>,
  ) {}

  async create(createDto: CreateStandardWorkingHoursDto): Promise<StandardWorkingHours> {
    // Check if already exists for this year and month
    const existing = await this.standardWorkingHoursRepository.findOne({
      where: {
        year: createDto.year,
        month: createDto.month,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Standard working hours for ${createDto.year}-${String(createDto.month).padStart(2, '0')} already exists`,
      );
    }

    const config = this.standardWorkingHoursRepository.create(createDto);
    return this.standardWorkingHoursRepository.save(config);
  }

  async findAll(): Promise<StandardWorkingHours[]> {
    return this.standardWorkingHoursRepository.find({
      order: { year: 'DESC', month: 'DESC' },
    });
  }

  async findByYearMonth(year: number, month: number): Promise<StandardWorkingHours | null> {
    return this.standardWorkingHoursRepository.findOne({
      where: { year, month },
    });
  }

  async findOne(id: string): Promise<StandardWorkingHours> {
    const config = await this.standardWorkingHoursRepository.findOne({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException('Standard working hours not found');
    }

    return config;
  }

  async update(
    id: string,
    updateDto: UpdateStandardWorkingHoursDto,
  ): Promise<StandardWorkingHours> {
    const config = await this.findOne(id);

    // Check if updating year/month and it conflicts with existing
    if ((updateDto.year || updateDto.month) && 
        (updateDto.year !== config.year || updateDto.month !== config.month)) {
      const newYear = updateDto.year ?? config.year;
      const newMonth = updateDto.month ?? config.month;
      
      const existing = await this.standardWorkingHoursRepository.findOne({
        where: {
          year: newYear,
          month: newMonth,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Standard working hours for ${newYear}-${String(newMonth).padStart(2, '0')} already exists`,
        );
      }
    }

    Object.assign(config, updateDto);
    return this.standardWorkingHoursRepository.save(config);
  }

  async remove(id: string): Promise<void> {
    const config = await this.findOne(id);
    await this.standardWorkingHoursRepository.remove(config);
  }

  /**
   * Get standard working hours for a specific period (YYYY-MM format)
   */
  async getByPeriod(period: string): Promise<StandardWorkingHours | null> {
    const [year, month] = period.split('-').map(Number);
    return this.findByYearMonth(year, month);
  }

  /**
   * Get or calculate default standard working hours for a month
   * If not configured, calculate based on working days (excluding weekends)
   */
  async getOrCalculate(year: number, month: number): Promise<{ hours: number; days: number }> {
    const config = await this.findByYearMonth(year, month);
    
    if (config) {
      return {
        hours: config.standardHours,
        days: config.standardDays,
      };
    }

    // Calculate default: working days * 8 hours
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }

    return {
      hours: workingDays * 8,
      days: workingDays,
    };
  }
}

