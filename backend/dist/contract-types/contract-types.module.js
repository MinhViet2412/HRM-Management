"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractTypesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const contract_type_entity_1 = require("../database/entities/contract-type.entity");
const contract_types_service_1 = require("./contract-types.service");
const contract_types_controller_1 = require("./contract-types.controller");
let ContractTypesModule = class ContractTypesModule {
};
exports.ContractTypesModule = ContractTypesModule;
exports.ContractTypesModule = ContractTypesModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([contract_type_entity_1.ContractType])],
        providers: [contract_types_service_1.ContractTypesService],
        controllers: [contract_types_controller_1.ContractTypesController],
        exports: [contract_types_service_1.ContractTypesService],
    })
], ContractTypesModule);
//# sourceMappingURL=contract-types.module.js.map