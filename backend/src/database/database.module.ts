import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Employee } from './entities/employee.entity';
import { Department } from './entities/department.entity';
import { Position } from './entities/position.entity';
import { Attendance } from './entities/attendance.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { Payroll } from './entities/payroll.entity';
import { AuditLog } from './entities/audit-log.entity';
import { Contract } from './entities/contract.entity';
import { ContractType } from './entities/contract-type.entity';
import { ContractTemplate } from './entities/contract-template.entity';
import { Payslip } from './entities/payslip.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Employee,
      Department,
      Position,
      Attendance,
      LeaveRequest,
      Payroll,
      AuditLog,
      Contract,
      ContractType,
      ContractTemplate,
      Payslip,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
