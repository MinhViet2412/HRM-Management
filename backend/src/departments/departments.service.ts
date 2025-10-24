import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../database/entities/department.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: any): Promise<Department> {
    const existingDepartment = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code },
    });

    if (existingDepartment) {
      throw new ConflictException('Department code already exists');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    const savedDepartment = await this.departmentRepository.save(department);
    return Array.isArray(savedDepartment) ? savedDepartment[0] : savedDepartment;
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['parent', 'children'],
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['parent', 'children', 'employees'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDepartmentDto: any): Promise<Department> {
    const department = await this.findOne(id);

    if (updateDepartmentDto.code && updateDepartmentDto.code !== department.code) {
      const existingDepartment = await this.departmentRepository.findOne({
        where: { code: updateDepartmentDto.code },
      });

      if (existingDepartment) {
        throw new ConflictException('Department code already exists');
      }
    }

    Object.assign(department, updateDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    await this.departmentRepository.remove(department);
  }
}
