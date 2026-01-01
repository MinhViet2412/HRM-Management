"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payroll_service_1 = require("./payroll.service");
const payroll_controller_1 = require("./payroll.controller");
const payroll_entity_1 = require("../database/entities/payroll.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const attendance_entity_1 = require("../database/entities/attendance.entity");
const contract_entity_1 = require("../database/entities/contract.entity");
const overtime_request_entity_1 = require("../database/entities/overtime-request.entity");
const insurance_config_module_1 = require("../insurance-config/insurance-config.module");
const tax_config_module_1 = require("../tax-config/tax-config.module");
const dependents_module_1 = require("../dependents/dependents.module");
const standard_working_hours_module_1 = require("../standard-working-hours/standard-working-hours.module");
let PayrollModule = class PayrollModule {
};
exports.PayrollModule = PayrollModule;
exports.PayrollModule = PayrollModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payroll_entity_1.Payroll, employee_entity_1.Employee, attendance_entity_1.Attendance, contract_entity_1.Contract, overtime_request_entity_1.OvertimeRequest]),
            insurance_config_module_1.InsuranceConfigModule,
            tax_config_module_1.TaxConfigModule,
            dependents_module_1.DependentsModule,
            standard_working_hours_module_1.StandardWorkingHoursModule,
        ],
        providers: [payroll_service_1.PayrollService],
        controllers: [payroll_controller_1.PayrollController],
        exports: [payroll_service_1.PayrollService],
    })
], PayrollModule);
//# sourceMappingURL=payroll.module.js.map