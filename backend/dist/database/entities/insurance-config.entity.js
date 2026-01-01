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
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsuranceConfig = exports.InsuranceType = void 0;
const typeorm_1 = require("typeorm");
var InsuranceType;
(function (InsuranceType) {
    InsuranceType["SOCIAL"] = "social";
    InsuranceType["HEALTH"] = "health";
    InsuranceType["UNEMPLOYMENT"] = "unemployment";
})(InsuranceType || (exports.InsuranceType = InsuranceType = {}));
let InsuranceConfig = class InsuranceConfig {
};
exports.InsuranceConfig = InsuranceConfig;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InsuranceConfig.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InsuranceType,
        unique: true,
    }),
    __metadata("design:type", String)
], InsuranceConfig.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], InsuranceConfig.prototype, "insuranceRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, default: 'contract_total_income' }),
    __metadata("design:type", String)
], InsuranceConfig.prototype, "salaryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], InsuranceConfig.prototype, "employeeRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], InsuranceConfig.prototype, "employerRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], InsuranceConfig.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InsuranceConfig.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InsuranceConfig.prototype, "updatedAt", void 0);
exports.InsuranceConfig = InsuranceConfig = __decorate([
    (0, typeorm_1.Entity)('insurance_config')
], InsuranceConfig);
//# sourceMappingURL=insurance-config.entity.js.map