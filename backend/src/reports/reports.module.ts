import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Employee } from '../database/entities/employee.entity';
import { Department } from '../database/entities/department.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Payroll } from '../database/entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Attendance, Payroll])],
  providers: [ReportsService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
