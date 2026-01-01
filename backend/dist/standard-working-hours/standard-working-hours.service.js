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
exports.StandardWorkingHoursService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const standard_working_hours_entity_1 = require("../database/entities/standard-working-hours.entity");
let StandardWorkingHoursService = class StandardWorkingHoursService {
    constructor(standardWorkingHoursRepository) {
        this.standardWorkingHoursRepository = standardWorkingHoursRepository;
    }
    async create(createDto) {
        const existing = await this.standardWorkingHoursRepository.findOne({
            where: {
                year: createDto.year,
                month: createDto.month,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Standard working hours for ${createDto.year}-${String(createDto.month).padStart(2, '0')} already exists`);
        }
        const config = this.standardWorkingHoursRepository.create(createDto);
        return this.standardWorkingHoursRepository.save(config);
    }
    async findAll() {
        return this.standardWorkingHoursRepository.find({
            order: { year: 'DESC', month: 'DESC' },
        });
    }
    async findByYearMonth(year, month) {
        return this.standardWorkingHoursRepository.findOne({
            where: { year, month },
        });
    }
    async findOne(id) {
        const config = await this.standardWorkingHoursRepository.findOne({
            where: { id },
        });
        if (!config) {
            throw new common_1.NotFoundException('Standard working hours not found');
        }
        return config;
    }
    async update(id, updateDto) {
        const config = await this.findOne(id);
        if ((updateDto.year || updateDto.month) &&
            (updateDto.year !== config.year || updateDto.month !== config.month)) {
            const newYear = updateDto.year ?? config.year;
            const newMonth = updateDto.month ?? config.month;
            const existing = await this.standardWorkingHoursRepository.findOne({
                where: {
                    year: newYear,
                    month: newMonth,
                },
            });
            if (existing && existing.id !== id) {
                throw new common_1.ConflictException(`Standard working hours for ${newYear}-${String(newMonth).padStart(2, '0')} already exists`);
            }
        }
        Object.assign(config, updateDto);
        return this.standardWorkingHoursRepository.save(config);
    }
    async remove(id) {
        const config = await this.findOne(id);
        await this.standardWorkingHoursRepository.remove(config);
    }
    async getByPeriod(period) {
        const [year, month] = period.split('-').map(Number);
        return this.findByYearMonth(year, month);
    }
    async getOrCalculate(year, month) {
        const config = await this.findByYearMonth(year, month);
        if (config) {
            return {
                hours: config.standardHours,
                days: config.standardDays,
            };
        }
        const daysInMonth = new Date(year, month, 0).getDate();
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        return {
            hours: workingDays * 8,
            days: workingDays,
        };
    }
};
exports.StandardWorkingHoursService = StandardWorkingHoursService;
exports.StandardWorkingHoursService = StandardWorkingHoursService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(standard_working_hours_entity_1.StandardWorkingHours)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StandardWorkingHoursService);
//# sourceMappingURL=standard-working-hours.service.js.map