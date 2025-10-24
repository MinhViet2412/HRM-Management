import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shift } from '../database/entities/shift.entity';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
  ) {}

  async create(data: Partial<Shift>) {
    const exists = await this.shiftRepository.findOne({ where: { name: data.name } });
    if (exists) throw new ConflictException('Shift name already exists');
    const shift = this.shiftRepository.create(data);
    return this.shiftRepository.save(shift);
  }

  findAll() {
    return this.shiftRepository.find();
  }

  async findOne(id: string) {
    const s = await this.shiftRepository.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Shift not found');
    return s;
  }

  async update(id: string, data: Partial<Shift>) {
    const s = await this.findOne(id);
    Object.assign(s, data);
    return this.shiftRepository.save(s);
  }

  async remove(id: string) {
    const s = await this.findOne(id);
    await this.shiftRepository.remove(s);
    return { message: 'Deleted' };
  }
}


