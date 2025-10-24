import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkLocation } from '../database/entities/work-location.entity';

@Injectable()
export class WorkLocationsService {
  constructor(
    @InjectRepository(WorkLocation)
    private workLocationRepository: Repository<WorkLocation>,
  ) {}

  async create(data: Partial<WorkLocation>) {
    const exists = await this.workLocationRepository.findOne({ where: { name: data.name } });
    if (exists) {
      throw new ConflictException('Work location name already exists');
    }
    const wl = this.workLocationRepository.create(data);
    return this.workLocationRepository.save(wl);
  }

  findAll() {
    return this.workLocationRepository.find();
  }

  async findOne(id: string) {
    const wl = await this.workLocationRepository.findOne({ where: { id } });
    if (!wl) throw new NotFoundException('Work location not found');
    return wl;
  }

  async update(id: string, data: Partial<WorkLocation>) {
    const wl = await this.findOne(id);
    Object.assign(wl, data);
    return this.workLocationRepository.save(wl);
  }

  async remove(id: string) {
    const wl = await this.findOne(id);
    await this.workLocationRepository.remove(wl);
    return { message: 'Deleted' };
  }
}


