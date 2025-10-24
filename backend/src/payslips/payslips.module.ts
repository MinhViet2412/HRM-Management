import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayslipsService } from './payslips.service';
import { PayslipsController } from './payslips.controller';
import { Payslip } from '../database/entities/payslip.entity';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payslip, Payroll, Employee, Attendance])],
  controllers: [PayslipsController],
  providers: [PayslipsService],
})
export class PayslipsModule {}


