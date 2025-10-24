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
exports.ShiftsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const shift_entity_1 = require("../database/entities/shift.entity");
let ShiftsService = class ShiftsService {
    constructor(shiftRepository) {
        this.shiftRepository = shiftRepository;
    }
    async create(data) {
        const exists = await this.shiftRepository.findOne({ where: { name: data.name } });
        if (exists)
            throw new common_1.ConflictException('Shift name already exists');
        const shift = this.shiftRepository.create(data);
        return this.shiftRepository.save(shift);
    }
    findAll() {
        return this.shiftRepository.find();
    }
    async findOne(id) {
        const s = await this.shiftRepository.findOne({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException('Shift not found');
        return s;
    }
    async update(id, data) {
        const s = await this.findOne(id);
        Object.assign(s, data);
        return this.shiftRepository.save(s);
    }
    async remove(id) {
        const s = await this.findOne(id);
        await this.shiftRepository.remove(s);
        return { message: 'Deleted' };
    }
};
exports.ShiftsService = ShiftsService;
exports.ShiftsService = ShiftsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShiftsService);
//# sourceMappingURL=shifts.service.js.map