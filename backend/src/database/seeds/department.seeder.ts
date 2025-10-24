import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';

@Injectable()
export class DepartmentSeeder {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async run(): Promise<void> {
    const departments = [
      {
        code: 'IT',
        name: 'Information Technology',
        description: 'IT Department',
      },
      {
        code: 'HR',
        name: 'Human Resources',
        description: 'HR Department',
      },
      {
        code: 'FIN',
        name: 'Finance',
        description: 'Finance Department',
      },
      {
        code: 'MKT',
        name: 'Marketing',
        description: 'Marketing Department',
      },
      {
        code: 'OPS',
        name: 'Operations',
        description: 'Operations Department',
      },
    ];

    for (const deptData of departments) {
      const existingDept = await this.departmentRepository.findOne({
        where: { code: deptData.code },
      });

      if (!existingDept) {
        const department = this.departmentRepository.create(deptData);
        await this.departmentRepository.save(department);
        console.log(`Created department: ${deptData.name}`);
      } else {
        console.log(`Department already exists: ${deptData.name}`);
      }
    }
  }
}
