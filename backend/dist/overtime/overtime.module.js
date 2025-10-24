"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OvertimeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const overtime_request_entity_1 = require("../database/entities/overtime-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const overtime_service_1 = require("./overtime.service");
const overtime_controller_1 = require("./overtime.controller");
let OvertimeModule = class OvertimeModule {
};
exports.OvertimeModule = OvertimeModule;
exports.OvertimeModule = OvertimeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([overtime_request_entity_1.OvertimeRequest, employee_entity_1.Employee])],
        providers: [overtime_service_1.OvertimeService],
        controllers: [overtime_controller_1.OvertimeController],
        exports: [overtime_service_1.OvertimeService],
    })
], OvertimeModule);
//# sourceMappingURL=overtime.module.js.map