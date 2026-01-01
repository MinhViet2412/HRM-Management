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
exports.TaxConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tax_config_entity_1 = require("../database/entities/tax-config.entity");
let TaxConfigService = class TaxConfigService {
    constructor(taxConfigRepository) {
        this.taxConfigRepository = taxConfigRepository;
        this.DEPENDENT_DEDUCTION_KEY = 'dependent_deduction_amount';
        this.DEFAULT_DEDUCTION_AMOUNT = 4400000;
    }
    async getDependentDeductionAmount() {
        const config = await this.taxConfigRepository.findOne({
            where: { key: this.DEPENDENT_DEDUCTION_KEY },
        });
        if (!config) {
            const newConfig = this.taxConfigRepository.create({
                key: this.DEPENDENT_DEDUCTION_KEY,
                value: this.DEFAULT_DEDUCTION_AMOUNT.toString(),
                description: 'Giá trị giảm trừ thuế cho mỗi người phụ thuộc (VNĐ)',
            });
            await this.taxConfigRepository.save(newConfig);
            return this.DEFAULT_DEDUCTION_AMOUNT;
        }
        return parseFloat(config.value) || this.DEFAULT_DEDUCTION_AMOUNT;
    }
    async updateDependentDeductionAmount(dto) {
        let config = await this.taxConfigRepository.findOne({
            where: { key: this.DEPENDENT_DEDUCTION_KEY },
        });
        if (!config) {
            config = this.taxConfigRepository.create({
                key: this.DEPENDENT_DEDUCTION_KEY,
                value: dto.amount.toString(),
                description: 'Giá trị giảm trừ thuế cho mỗi người phụ thuộc (VNĐ)',
            });
        }
        else {
            config.value = dto.amount.toString();
        }
        return this.taxConfigRepository.save(config);
    }
    async findAll() {
        return this.taxConfigRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findByKey(key) {
        const config = await this.taxConfigRepository.findOne({
            where: { key },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Tax config with key "${key}" not found`);
        }
        return config;
    }
    async update(key, updateDto) {
        const config = await this.findByKey(key);
        if (updateDto.value !== undefined) {
            config.value = updateDto.value;
        }
        if (updateDto.description !== undefined) {
            config.description = updateDto.description;
        }
        return this.taxConfigRepository.save(config);
    }
};
exports.TaxConfigService = TaxConfigService;
exports.TaxConfigService = TaxConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tax_config_entity_1.TaxConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TaxConfigService);
//# sourceMappingURL=tax-config.service.js.map