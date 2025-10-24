import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EmployeesModule } from './employees/employees.module';
import { DepartmentsModule } from './departments/departments.module';
import { PositionsModule } from './positions/positions.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { ReportsModule } from './reports/reports.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { DatabaseModule } from './database/database.module';
import { ResignationsModule } from './resignations/resignations.module';
import { RoleSeeder } from './database/seeds/role.seeder';
import { UserSeeder } from './database/seeds/user.seeder';
import { DepartmentSeeder } from './database/seeds/department.seeder';
import { PositionSeeder } from './database/seeds/position.seeder';
import { EmployeeSeeder } from './database/seeds/employee.seeder';
import { ContractTypeSeeder } from './database/seeds/contract-type.seeder';
import { ContractTemplateSeeder } from './database/seeds/contract-template.seeder';
import { WorkLocationsModule } from './work-locations/work-locations.module';
import { ShiftsModule } from './shifts/shifts.module';
import { ContractsModule } from './contracts/contracts.module';
import { ContractTypesModule } from './contract-types/contract-types.module';
import { PayslipsModule } from './payslips/payslips.module';
import { OvertimeModule } from './overtime/overtime.module';
import { AttendanceSeeder } from './database/seeds/attendance.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'hrm_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Enable for development
      logging: process.env.NODE_ENV === 'development',
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    DepartmentsModule,
    PositionsModule,
    AttendanceModule,
    LeaveModule,
    PayrollModule,
    ReportsModule,
    AuditLogModule,
    ResignationsModule,
    WorkLocationsModule,
    ShiftsModule,
    ContractsModule,
    ContractTypesModule,
    PayslipsModule,
    OvertimeModule,
  ],
  providers: [
    RoleSeeder,
    UserSeeder,
    DepartmentSeeder,
    PositionSeeder,
    EmployeeSeeder,
    ContractTypeSeeder,
    ContractTemplateSeeder,
    AttendanceSeeder,
  ],
})
export class AppModule {}
