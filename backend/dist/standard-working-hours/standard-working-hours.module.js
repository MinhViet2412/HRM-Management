"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StandardWorkingHoursModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const standard_working_hours_service_1 = require("./standard-working-hours.service");
const standard_working_hours_controller_1 = require("./standard-working-hours.controller");
const standard_working_hours_entity_1 = require("../database/entities/standard-working-hours.entity");
let StandardWorkingHoursModule = class StandardWorkingHoursModule {
};
exports.StandardWorkingHoursModule = StandardWorkingHoursModule;
exports.StandardWorkingHoursModule = StandardWorkingHoursModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([standard_working_hours_entity_1.StandardWorkingHours])],
        providers: [standard_working_hours_service_1.StandardWorkingHoursService],
        controllers: [standard_working_hours_controller_1.StandardWorkingHoursController],
        exports: [standard_working_hours_service_1.StandardWorkingHoursService],
    })
], StandardWorkingHoursModule);
//# sourceMappingURL=standard-working-hours.module.js.map