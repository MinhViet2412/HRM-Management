import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleName } from '../entities/role.entity';

@Injectable()
export class RoleSeeder {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const roles = [
      {
        name: RoleName.ADMIN,
        description: 'System Administrator',
        permissions: ['*'],
      },
      {
        name: RoleName.HR,
        description: 'Human Resources',
        permissions: [
          'employees:read',
          'employees:write',
          'attendance:read',
          'attendance:write',
          'leave:read',
          'leave:write',
          'payroll:read',
          'payroll:write',
          'reports:read',
        ],
      },
      {
        name: RoleName.MANAGER,
        description: 'Department Manager',
        permissions: [
          'employees:read',
          'attendance:read',
          'attendance:write',
          'leave:read',
          'leave:write',
          'reports:read',
        ],
      },
      {
        name: RoleName.EMPLOYEE,
        description: 'Employee',
        permissions: [
          'attendance:read',
          'attendance:write',
          'leave:read',
          'leave:write',
        ],
      },
    ];

    for (const roleData of roles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
        console.log(`Created role: ${roleData.name}`);
      } else {
        console.log(`Role already exists: ${roleData.name}`);
      }
    }
  }
}
