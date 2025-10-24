import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';
import { DepartmentSeeder } from './department.seeder';
import { PositionSeeder } from './position.seeder';
import { EmployeeSeeder } from './employee.seeder';
import { ContractTypeSeeder } from './contract-type.seeder';
import { ContractTemplateSeeder } from './contract-template.seeder';
import { AttendanceSeeder } from './attendance.seeder';

async function runSeeds() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    console.log('Starting database seeding...');

    // Run seeders in order
    await app.get(RoleSeeder).run();
    await app.get(UserSeeder).run();
    await app.get(DepartmentSeeder).run();
    await app.get(PositionSeeder).run();
    await app.get(EmployeeSeeder).run();
    await app.get(ContractTypeSeeder).run();
    await app.get(ContractTemplateSeeder).run();
    await app.get(AttendanceSeeder).run();

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await app.close();
  }
}

runSeeds();
