import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { WorkingHoursCalculator } from './working-hours-calculator.service';
import { AttendanceRuleEngine } from './attendance-rule-engine.service';
import { Attendance } from '../database/entities/attendance.entity';
import { Employee } from '../database/entities/employee.entity';
import { WorkLocation } from '../database/entities/work-location.entity';
import { HolidaysModule } from '../holidays/holidays.module';
import { StandardWorkingHoursModule } from '../standard-working-hours/standard-working-hours.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Employee, WorkLocation]),
    HolidaysModule,
    StandardWorkingHoursModule,
  ],
  providers: [AttendanceService, WorkingHoursCalculator, AttendanceRuleEngine],
  controllers: [AttendanceController],
  exports: [AttendanceService, WorkingHoursCalculator, AttendanceRuleEngine],
})
export class AttendanceModule {}
