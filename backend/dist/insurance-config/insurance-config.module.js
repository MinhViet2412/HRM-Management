"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceConfigModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const insurance_config_service_1 = require("./insurance-config.service");
const insurance_config_controller_1 = require("./insurance-config.controller");
const insurance_config_entity_1 = require("../database/entities/insurance-config.entity");
let InsuranceConfigModule = class InsuranceConfigModule {
};
exports.InsuranceConfigModule = InsuranceConfigModule;
exports.InsuranceConfigModule = InsuranceConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([insurance_config_entity_1.InsuranceConfig])],
        controllers: [insurance_config_controller_1.InsuranceConfigController],
        providers: [insurance_config_service_1.InsuranceConfigService],
        exports: [insurance_config_service_1.InsuranceConfigService],
    })
], InsuranceConfigModule);
//# sourceMappingURL=insurance-config.module.js.map