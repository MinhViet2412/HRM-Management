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
exports.TaxConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tax_config_service_1 = require("./tax-config.service");
const update_tax_config_dto_1 = require("./dto/update-tax-config.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let TaxConfigController = class TaxConfigController {
    constructor(taxConfigService) {
        this.taxConfigService = taxConfigService;
    }
    findAll() {
        return this.taxConfigService.findAll();
    }
    getDependentDeductionAmount() {
        return this.taxConfigService.getDependentDeductionAmount();
    }
    updateDependentDeductionAmount(dto) {
        return this.taxConfigService.updateDependentDeductionAmount(dto);
    }
    findByKey(key) {
        return this.taxConfigService.findByKey(key);
    }
    update(key, updateDto) {
        return this.taxConfigService.update(key, updateDto);
    }
};
exports.TaxConfigController = TaxConfigController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tax configurations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaxConfigController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('dependent-deduction'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dependent deduction amount' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], TaxConfigController.prototype, "getDependentDeductionAmount", null);
__decorate([
    (0, common_1.Patch)('dependent-deduction'),
    (0, swagger_1.ApiOperation)({ summary: 'Update dependent deduction amount' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_tax_config_dto_1.UpdateDependentDeductionDto]),
    __metadata("design:returntype", void 0)
], TaxConfigController.prototype, "updateDependentDeductionAmount", null);
__decorate([
    (0, common_1.Get)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tax config by key' }),
    __param(0, (0, common_1.Param)('key')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TaxConfigController.prototype, "findByKey", null);
__decorate([
    (0, common_1.Patch)(':key'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tax config by key' }),
    __param(0, (0, common_1.Param)('key')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_tax_config_dto_1.UpdateTaxConfigDto]),
    __metadata("design:returntype", void 0)
], TaxConfigController.prototype, "update", null);
exports.TaxConfigController = TaxConfigController = __decorate([
    (0, swagger_1.ApiTags)('Tax Config'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tax-config'),
    __metadata("design:paramtypes", [tax_config_service_1.TaxConfigService])
], TaxConfigController);
//# sourceMappingURL=tax-config.controller.js.map