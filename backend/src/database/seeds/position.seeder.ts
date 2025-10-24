import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../entities/position.entity';

@Injectable()
export class PositionSeeder {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async run(): Promise<void> {
    const positions = [
      {
        code: 'DEV',
        title: 'Software Developer',
        description: 'Software Developer Position',
        minSalary: 50000,
        maxSalary: 80000,
      },
      {
        code: 'SENIOR_DEV',
        title: 'Senior Software Developer',
        description: 'Senior Software Developer Position',
        minSalary: 80000,
        maxSalary: 120000,
      },
      {
        code: 'MANAGER',
        title: 'Manager',
        description: 'Manager Position',
        minSalary: 70000,
        maxSalary: 100000,
      },
      {
        code: 'HR_SPECIALIST',
        title: 'HR Specialist',
        description: 'Human Resources Specialist',
        minSalary: 45000,
        maxSalary: 65000,
      },
      {
        code: 'ACCOUNTANT',
        title: 'Accountant',
        description: 'Accountant Position',
        minSalary: 40000,
        maxSalary: 60000,
      },
    ];

    for (const posData of positions) {
      const existingPos = await this.positionRepository.findOne({
        where: { code: posData.code },
      });

      if (!existingPos) {
        const position = this.positionRepository.create(posData);
        await this.positionRepository.save(position);
        console.log(`Created position: ${posData.title}`);
      } else {
        console.log(`Position already exists: ${posData.title}`);
      }
    }
  }
}
