"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkLocationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const work_location_entity_1 = require("../database/entities/work-location.entity");
const work_locations_service_1 = require("./work-locations.service");
const work_locations_controller_1 = require("./work-locations.controller");
let WorkLocationsModule = class WorkLocationsModule {
};
exports.WorkLocationsModule = WorkLocationsModule;
exports.WorkLocationsModule = WorkLocationsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([work_location_entity_1.WorkLocation])],
        providers: [work_locations_service_1.WorkLocationsService],
        controllers: [work_locations_controller_1.WorkLocationsController],
        exports: [work_locations_service_1.WorkLocationsService],
    })
], WorkLocationsModule);
//# sourceMappingURL=work-locations.module.js.map