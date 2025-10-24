"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./entities/user.entity");
const role_entity_1 = require("./entities/role.entity");
const employee_entity_1 = require("./entities/employee.entity");
const department_entity_1 = require("./entities/department.entity");
const position_entity_1 = require("./entities/position.entity");
const attendance_entity_1 = require("./entities/attendance.entity");
const leave_request_entity_1 = require("./entities/leave-request.entity");
const payroll_entity_1 = require("./entities/payroll.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
const contract_entity_1 = require("./entities/contract.entity");
const contract_type_entity_1 = require("./entities/contract-type.entity");
const contract_template_entity_1 = require("./entities/contract-template.entity");
const payslip_entity_1 = require("./entities/payslip.entity");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                user_entity_1.User,
                role_entity_1.Role,
                employee_entity_1.Employee,
                department_entity_1.Department,
                position_entity_1.Position,
                attendance_entity_1.Attendance,
                leave_request_entity_1.LeaveRequest,
                payroll_entity_1.Payroll,
                audit_log_entity_1.AuditLog,
                contract_entity_1.Contract,
                contract_type_entity_1.ContractType,
                contract_template_entity_1.ContractTemplate,
                payslip_entity_1.Payslip,
            ]),
        ],
        exports: [typeorm_1.TypeOrmModule],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map