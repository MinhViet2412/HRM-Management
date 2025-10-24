"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResignationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const resignations_service_1 = require("./resignations.service");
const resignations_controller_1 = require("./resignations.controller");
const resignation_request_entity_1 = require("../database/entities/resignation-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const user_entity_1 = require("../database/entities/user.entity");
const resignations_processor_1 = require("./resignations.processor");
let ResignationsModule = class ResignationsModule {
};
exports.ResignationsModule = ResignationsModule;
exports.ResignationsModule = ResignationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([resignation_request_entity_1.ResignationRequest, employee_entity_1.Employee, user_entity_1.User])],
        controllers: [resignations_controller_1.ResignationsController],
        providers: [resignations_service_1.ResignationsService, resignations_processor_1.ResignationsProcessor],
    })
], ResignationsModule);
//# sourceMappingURL=resignations.module.js.map