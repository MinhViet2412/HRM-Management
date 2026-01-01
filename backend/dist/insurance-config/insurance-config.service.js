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
exports.InsuranceConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const insurance_config_entity_1 = require("../database/entities/insurance-config.entity");
let InsuranceConfigService = class InsuranceConfigService {
    constructor(insuranceConfigRepository) {
        this.insuranceConfigRepository = insuranceConfigRepository;
    }
    async create(createDto) {
        const existing = await this.insuranceConfigRepository.findOne({
            where: { type: createDto.type },
        });
        if (existing) {
            throw new common_1.ConflictException(`Insurance config with type "${createDto.type}" already exists`);
        }
        const config = this.insuranceConfigRepository.create({
            ...createDto,
            isActive: createDto.isActive ?? true,
        });
        return this.insuranceConfigRepository.save(config);
    }
    async findAll() {
        return this.insuranceConfigRepository.find({
            order: { createdAt: 'ASC' },
        });
    }
    async findActive() {
        return this.insuranceConfigRepository.find({
            where: { isActive: true },
            order: { createdAt: 'ASC' },
        });
    }
    async findOne(id) {
        const config = await this.insuranceConfigRepository.findOne({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Insurance config not found');
        }
        return config;
    }
    async findByType(type) {
        const config = await this.insuranceConfigRepository.findOne({
            where: { type },
        });
        if (!config) {
            throw new common_1.NotFoundException(`Insurance config with type "${type}" not found`);
        }
        return config;
    }
    async update(id, updateDto) {
        const config = await this.findOne(id);
        if (updateDto.type && updateDto.type !== config.type) {
            const existing = await this.insuranceConfigRepository.findOne({
                where: { type: updateDto.type },
            });
            if (existing) {
                throw new common_1.ConflictException(`Insurance config with type "${updateDto.type}" already exists`);
            }
        }
        Object.assign(config, updateDto);
        return this.insuranceConfigRepository.save(config);
    }
    async remove(id) {
        const config = await this.findOne(id);
        await this.insuranceConfigRepository.remove(config);
    }
    async calculateEmployeeInsurance(salary, type) {
        const config = await this.findByType(type);
        if (!config.isActive) {
            return 0;
        }
        const rate = config.employeeRate ?? config.insuranceRate;
        return (salary * rate) / 100;
    }
    async calculateEmployerInsurance(salary, type) {
        const config = await this.findByType(type);
        if (!config.isActive) {
            return 0;
        }
        const rate = config.employerRate ?? config.insuranceRate;
        return (salary * rate) / 100;
    }
    async calculateTotalInsurance(salary, type) {
        const employeeAmount = await this.calculateEmployeeInsurance(salary, type);
        const employerAmount = await this.calculateEmployerInsurance(salary, type);
        return employeeAmount + employerAmount;
    }
};
exports.InsuranceConfigService = InsuranceConfigService;
exports.InsuranceConfigService = InsuranceConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(insurance_config_entity_1.InsuranceConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InsuranceConfigService);
//# sourceMappingURL=insurance-config.service.js.map