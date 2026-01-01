"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const insurance_config_service_1 = require("./insurance-config.service");
const create_insurance_config_dto_1 = require("./dto/create-insurance-config.dto");
const update_insurance_config_dto_1 = require("./dto/update-insurance-config.dto");
const insurance_config_entity_1 = require("../database/entities/insurance-config.entity");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InsuranceConfigController = class InsuranceConfigController {
    constructor(insuranceConfigService) {
        this.insuranceConfigService = insuranceConfigService;
    }
    create(createDto) {
        return this.insuranceConfigService.create(createDto);
    }
    findAll(activeOnly) {
        if (activeOnly === 'true') {
            return this.insuranceConfigService.findActive();
        }
        return this.insuranceConfigService.findAll();
    }
    calculate(salary, type) {
        const salaryNum = parseFloat(salary);
        return this.insuranceConfigService.calculateTotalInsurance(salaryNum, type);
    }
    findOne(id) {
        return this.insuranceConfigService.findOne(id);
    }
    update(id, updateDto) {
        return this.insuranceConfigService.update(id, updateDto);
    }
    remove(id) {
        return this.insuranceConfigService.remove(id);
    }
};
exports.InsuranceConfigController = InsuranceConfigController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new insurance config' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_insurance_config_dto_1.CreateInsuranceConfigDto]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all insurance configs' }),
    __param(0, (0, common_1.Query)('activeOnly')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('calculate'),
    (0, swagger_1.ApiOperation)({ summary: 'Calculate insurance amount' }),
    __param(0, (0, common_1.Query)('salary')),
    __param(1, (0, common_1.Query)('type')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "calculate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get insurance config by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update insurance config' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_insurance_config_dto_1.UpdateInsuranceConfigDto]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete insurance config' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InsuranceConfigController.prototype, "remove", null);
exports.InsuranceConfigController = InsuranceConfigController = __decorate([
    (0, swagger_1.ApiTags)('Insurance Config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('insurance-config'),
    __metadata("design:paramtypes", [insurance_config_service_1.InsuranceConfigService])
], InsuranceConfigController);
//# sourceMappingURL=insurance-config.controller.js.map