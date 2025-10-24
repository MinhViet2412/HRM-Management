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
exports.WorkLocationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const work_location_entity_1 = require("../database/entities/work-location.entity");
let WorkLocationsService = class WorkLocationsService {
    constructor(workLocationRepository) {
        this.workLocationRepository = workLocationRepository;
    }
    async create(data) {
        const exists = await this.workLocationRepository.findOne({ where: { name: data.name } });
        if (exists) {
            throw new common_1.ConflictException('Work location name already exists');
        }
        const wl = this.workLocationRepository.create(data);
        return this.workLocationRepository.save(wl);
    }
    findAll() {
        return this.workLocationRepository.find();
    }
    async findOne(id) {
        const wl = await this.workLocationRepository.findOne({ where: { id } });
        if (!wl)
            throw new common_1.NotFoundException('Work location not found');
        return wl;
    }
    async update(id, data) {
        const wl = await this.findOne(id);
        Object.assign(wl, data);
        return this.workLocationRepository.save(wl);
    }
    async remove(id) {
        const wl = await this.findOne(id);
        await this.workLocationRepository.remove(wl);
        return { message: 'Deleted' };
    }
};
exports.WorkLocationsService = WorkLocationsService;
exports.WorkLocationsService = WorkLocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(work_location_entity_1.WorkLocation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WorkLocationsService);
//# sourceMappingURL=work-locations.service.js.map