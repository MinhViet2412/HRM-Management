"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayslipsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payslips_service_1 = require("./payslips.service");
const payslips_controller_1 = require("./payslips.controller");
const payslip_entity_1 = require("../database/entities/payslip.entity");
const payroll_entity_1 = require("../database/entities/payroll.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const attendance_entity_1 = require("../database/entities/attendance.entity");
let PayslipsModule = class PayslipsModule {
};
exports.PayslipsModule = PayslipsModule;
exports.PayslipsModule = PayslipsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([payslip_entity_1.Payslip, payroll_entity_1.Payroll, employee_entity_1.Employee, attendance_entity_1.Attendance])],
        controllers: [payslips_controller_1.PayslipsController],
        providers: [payslips_service_1.PayslipsService],
    })
], PayslipsModule);
//# sourceMappingURL=payslips.module.js.map