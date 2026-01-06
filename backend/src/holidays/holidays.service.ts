import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Holiday } from '../database/entities/holiday.entity';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday)
    private readonly holidayRepository: Repository<Holiday>,
  ) {}

  async create(createDto: CreateHolidayDto): Promise<Holiday> {
    const existing = await this.holidayRepository.findOne({
      where: { date: createDto.date as any },
    });

    if (existing) {
      throw new ConflictException('Holiday for this date already exists');
    }

    const entity = this.holidayRepository.create({
      ...createDto,
      date: new Date(createDto.date),
    });

    return this.holidayRepository.save(entity);
  }

  findAll(): Promise<Holiday[]> {
    return this.holidayRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Holiday> {
    const holiday = await this.holidayRepository.findOne({ where: { id } });
    if (!holiday) {
      throw new NotFoundException('Holiday not found');
    }
    return holiday;
  }

  async update(id: string, updateDto: UpdateHolidayDto): Promise<Holiday> {
    const holiday = await this.findOne(id);

    if (updateDto.date && updateDto.date !== holiday.date.toISOString().split('T')[0]) {
      const conflict = await this.holidayRepository.findOne({
        where: { date: updateDto.date as any },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException('Holiday for this date already exists');
      }
    }

    Object.assign(holiday, updateDto);
    if (updateDto.date) {
      holiday.date = new Date(updateDto.date);
    }

    return this.holidayRepository.save(holiday);
  }

  async remove(id: string): Promise<void> {
    const holiday = await this.findOne(id);
    await this.holidayRepository.remove(holiday);
  }

  async findByDateRange(start: Date, end: Date): Promise<Holiday[]> {
    return this.holidayRepository.find({
      where: { date: Between(start, end) },
      order: { date: 'ASC' },
    });
  }
}

