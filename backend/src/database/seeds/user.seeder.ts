import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../entities/user.entity';
import { Role, RoleName } from '../entities/role.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async run(): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: RoleName.ADMIN },
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Please run role seeder first.');
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { email: 'admin@company.com' },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const adminUser = this.userRepository.create({
        email: 'admin@company.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        roleId: adminRole.id,
        status: UserStatus.ACTIVE,
      });

      await this.userRepository.save(adminUser);
      console.log('Created admin user: admin@company.com');
    } else {
      console.log('Admin user already exists');
    }
  }
}
