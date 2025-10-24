import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Contract } from '../database/entities/contract.entity';
import { OvertimeRequest } from '../database/entities/overtime-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll, Employee, Attendance, Contract, OvertimeRequest])],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}
