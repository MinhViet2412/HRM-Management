"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const employees_module_1 = require("./employees/employees.module");
const departments_module_1 = require("./departments/departments.module");
const positions_module_1 = require("./positions/positions.module");
const attendance_module_1 = require("./attendance/attendance.module");
const leave_module_1 = require("./leave/leave.module");
const payroll_module_1 = require("./payroll/payroll.module");
const reports_module_1 = require("./reports/reports.module");
const audit_log_module_1 = require("./audit-log/audit-log.module");
const database_module_1 = require("./database/database.module");
const resignations_module_1 = require("./resignations/resignations.module");
const role_seeder_1 = require("./database/seeds/role.seeder");
const user_seeder_1 = require("./database/seeds/user.seeder");
const department_seeder_1 = require("./database/seeds/department.seeder");
const position_seeder_1 = require("./database/seeds/position.seeder");
const employee_seeder_1 = require("./database/seeds/employee.seeder");
const contract_type_seeder_1 = require("./database/seeds/contract-type.seeder");
const contract_template_seeder_1 = require("./database/seeds/contract-template.seeder");
const work_locations_module_1 = require("./work-locations/work-locations.module");
const shifts_module_1 = require("./shifts/shifts.module");
const contracts_module_1 = require("./contracts/contracts.module");
const contract_types_module_1 = require("./contract-types/contract-types.module");
const payslips_module_1 = require("./payslips/payslips.module");
const overtime_module_1 = require("./overtime/overtime.module");
const attendance_seeder_1 = require("./database/seeds/attendance.seeder");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT) || 5432,
                username: process.env.DB_USERNAME || 'postgres',
                password: process.env.DB_PASSWORD || 'password',
                database: process.env.DB_DATABASE || 'hrm_db',
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: true,
                logging: process.env.NODE_ENV === 'development',
            }),
            schedule_1.ScheduleModule.forRoot(),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            employees_module_1.EmployeesModule,
            departments_module_1.DepartmentsModule,
            positions_module_1.PositionsModule,
            attendance_module_1.AttendanceModule,
            leave_module_1.LeaveModule,
            payroll_module_1.PayrollModule,
            reports_module_1.ReportsModule,
            audit_log_module_1.AuditLogModule,
            resignations_module_1.ResignationsModule,
            work_locations_module_1.WorkLocationsModule,
            shifts_module_1.ShiftsModule,
            contracts_module_1.ContractsModule,
            contract_types_module_1.ContractTypesModule,
            payslips_module_1.PayslipsModule,
            overtime_module_1.OvertimeModule,
        ],
        providers: [
            role_seeder_1.RoleSeeder,
            user_seeder_1.UserSeeder,
            department_seeder_1.DepartmentSeeder,
            position_seeder_1.PositionSeeder,
            employee_seeder_1.EmployeeSeeder,
            contract_type_seeder_1.ContractTypeSeeder,
            contract_template_seeder_1.ContractTemplateSeeder,
            attendance_seeder_1.AttendanceSeeder,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map