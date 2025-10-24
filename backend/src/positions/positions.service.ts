import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../database/entities/position.entity';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async create(createPositionDto: any): Promise<Position> {
    const existingPosition = await this.positionRepository.findOne({
      where: { code: createPositionDto.code },
    });

    if (existingPosition) {
      throw new ConflictException('Position code already exists');
    }

    const position = this.positionRepository.create(createPositionDto);
    const savedPosition = await this.positionRepository.save(position);
    return Array.isArray(savedPosition) ? savedPosition[0] : savedPosition;
  }

  async findAll(): Promise<Position[]> {
    return this.positionRepository.find();
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepository.findOne({
      where: { id },
      relations: ['employees'],
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return position;
  }

  async update(id: string, updatePositionDto: any): Promise<Position> {
    const position = await this.findOne(id);

    if (updatePositionDto.code && updatePositionDto.code !== position.code) {
      const existingPosition = await this.positionRepository.findOne({
        where: { code: updatePositionDto.code },
      });

      if (existingPosition) {
        throw new ConflictException('Position code already exists');
      }
    }

    Object.assign(position, updatePositionDto);
    return this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepository.remove(position);
  }
}
