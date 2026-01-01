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
exports.LeaveLimitConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_limit_config_entity_1 = require("../database/entities/leave-limit-config.entity");
let LeaveLimitConfigService = class LeaveLimitConfigService {
    constructor(leaveLimitConfigRepository) {
        this.leaveLimitConfigRepository = leaveLimitConfigRepository;
    }
    async create(createDto) {
        const existing = await this.leaveLimitConfigRepository.findOne({
            where: { leaveType: createDto.leaveType, year: createDto.year },
        });
        if (existing) {
            throw new common_1.ConflictException(`Leave limit config for type "${createDto.leaveType}" and year ${createDto.year} already exists`);
        }
        const config = this.leaveLimitConfigRepository.create({
            ...createDto,
            isActive: createDto.isActive ?? true,
        });
        return this.leaveLimitConfigRepository.save(config);
    }
    async findAll() {
        return this.leaveLimitConfigRepository.find({
            order: { year: 'DESC', leaveType: 'ASC' },
        });
    }
    async findByYear(year) {
        return this.leaveLimitConfigRepository.find({
            where: { year, isActive: true },
            order: { leaveType: 'ASC' },
        });
    }
    async findByTypeAndYear(leaveType, year) {
        return this.leaveLimitConfigRepository.findOne({
            where: { leaveType, year, isActive: true },
        });
    }
    async findOne(id) {
        const config = await this.leaveLimitConfigRepository.findOne({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Leave limit config not found');
        }
        return config;
    }
    async update(id, updateDto) {
        const config = await this.findOne(id);
        if ((updateDto.leaveType && updateDto.leaveType !== config.leaveType) ||
            (updateDto.year && updateDto.year !== config.year)) {
            const existing = await this.leaveLimitConfigRepository.findOne({
                where: {
                    leaveType: updateDto.leaveType ?? config.leaveType,
                    year: updateDto.year ?? config.year,
                },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Leave limit config for type "${updateDto.leaveType ?? config.leaveType}" and year ${updateDto.year ?? config.year} already exists`);
            }
        }
        Object.assign(config, updateDto);
        return this.leaveLimitConfigRepository.save(config);
    }
    async remove(id) {
        const config = await this.findOne(id);
        await this.leaveLimitConfigRepository.remove(config);
    }
    async getMaxDays(leaveType, year) {
        const config = await this.findByTypeAndYear(leaveType, year);
        return config ? Number(config.maxDays) : null;
    }
};
exports.LeaveLimitConfigService = LeaveLimitConfigService;
exports.LeaveLimitConfigService = LeaveLimitConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_limit_config_entity_1.LeaveLimitConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LeaveLimitConfigService);
//# sourceMappingURL=leave-limit-config.service.js.map