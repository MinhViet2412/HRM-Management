import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, Gender, EmployeeStatus } from '../entities/employee.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';

@Injectable()
export class EmployeeSeeder {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async run(): Promise<void> {
    const itDept = await this.departmentRepository.findOne({
      where: { code: 'IT' },
    });
    const hrDept = await this.departmentRepository.findOne({
      where: { code: 'HR' },
    });

    const devPos = await this.positionRepository.findOne({
      where: { code: 'DEV' },
    });
    const hrPos = await this.positionRepository.findOne({
      where: { code: 'HR_SPECIALIST' },
    });

    if (!itDept || !hrDept || !devPos || !hrPos) {
      throw new Error('Required departments or positions not found. Please run department and position seeders first.');
    }

    const employees = [
      {
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '+1234567891',
        dateOfBirth: new Date('1990-01-15'),
        gender: Gender.MALE,
        basicSalary: 60000,
        allowance: 5000,
        hireDate: new Date('2023-01-01'),
        departmentId: itDept.id,
        positionId: devPos.id,
      },
      {
        employeeCode: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1234567892',
        dateOfBirth: new Date('1988-05-20'),
        gender: Gender.FEMALE,
        basicSalary: 55000,
        allowance: 4000,
        hireDate: new Date('2023-02-01'),
        departmentId: hrDept.id,
        positionId: hrPos.id,
      },
      {
        employeeCode: 'EMP003',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@company.com',
        phone: '+1234567893',
        dateOfBirth: new Date('1992-08-10'),
        gender: Gender.MALE,
        basicSalary: 65000,
        allowance: 6000,
        hireDate: new Date('2023-03-01'),
        departmentId: itDept.id,
        positionId: devPos.id,
      },
      {
        employeeCode: 'EMP004',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@company.com',
        phone: '+1234567894',
        dateOfBirth: new Date('1991-12-05'),
        gender: Gender.FEMALE,
        basicSalary: 58000,
        allowance: 4500,
        hireDate: new Date('2023-04-01'),
        departmentId: hrDept.id,
        positionId: hrPos.id,
      },
      {
        employeeCode: 'EMP005',
        firstName: 'David',
        lastName: 'Brown',
        email: 'david.brown@company.com',
        phone: '+1234567895',
        dateOfBirth: new Date('1989-07-25'),
        gender: Gender.MALE,
        basicSalary: 62000,
        allowance: 5500,
        hireDate: new Date('2023-05-01'),
        departmentId: itDept.id,
        positionId: devPos.id,
      },
    ];

    for (const empData of employees) {
      const existingEmp = await this.employeeRepository.findOne({
        where: { employeeCode: empData.employeeCode },
      });

      if (!existingEmp) {
        const employee = this.employeeRepository.create(empData);
        await this.employeeRepository.save(employee);
        console.log(`Created employee: ${empData.firstName} ${empData.lastName}`);
      } else {
        console.log(`Employee already exists: ${empData.firstName} ${empData.lastName}`);
      }
    }
  }
}
