import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Contract } from '../database/entities/contract.entity';
import { OvertimeRequest } from '../database/entities/overtime-request.entity';
import { InsuranceConfigModule } from '../insurance-config/insurance-config.module';
import { TaxConfigModule } from '../tax-config/tax-config.module';
import { DependentsModule } from '../dependents/dependents.module';
import { StandardWorkingHoursModule } from '../standard-working-hours/standard-working-hours.module';
import { HolidaysModule } from '../holidays/holidays.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payroll, Employee, Attendance, Contract, OvertimeRequest]),
    InsuranceConfigModule,
    TaxConfigModule,
    DependentsModule,
    StandardWorkingHoursModule,
    HolidaysModule,
  ],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}
