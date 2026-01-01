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
exports.DependentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dependent_entity_1 = require("../database/entities/dependent.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const tax_config_service_1 = require("../tax-config/tax-config.service");
let DependentsService = class DependentsService {
    constructor(dependentRepository, employeeRepository, taxConfigService) {
        this.dependentRepository = dependentRepository;
        this.employeeRepository = employeeRepository;
        this.taxConfigService = taxConfigService;
    }
    async create(createDependentDto) {
        const employee = await this.employeeRepository.findOne({
            where: { id: createDependentDto.employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const defaultDeductionAmount = createDependentDto.deductionAmount
            ?? await this.taxConfigService.getDependentDeductionAmount();
        const dependent = this.dependentRepository.create({
            ...createDependentDto,
            dateOfBirth: createDependentDto.dateOfBirth
                ? new Date(createDependentDto.dateOfBirth)
                : null,
            isActive: createDependentDto.isActive ?? true,
            deductionAmount: defaultDeductionAmount,
        });
        return this.dependentRepository.save(dependent);
    }
    async findAll(employeeId) {
        const query = this.dependentRepository.createQueryBuilder('dependent');
        if (employeeId) {
            query.where('dependent.employeeId = :employeeId', { employeeId });
        }
        return query
            .leftJoinAndSelect('dependent.employee', 'employee')
            .orderBy('dependent.createdAt', 'DESC')
            .getMany();
    }
    async findOne(id) {
        const dependent = await this.dependentRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!dependent) {
            throw new common_1.NotFoundException('Dependent not found');
        }
        return dependent;
    }
    async findByEmployeeId(employeeId) {
        return this.dependentRepository.find({
            where: { employeeId },
            order: { createdAt: 'DESC' },
        });
    }
    async update(id, updateDependentDto) {
        const dependent = await this.findOne(id);
        if (updateDependentDto.employeeId) {
            const employee = await this.employeeRepository.findOne({
                where: { id: updateDependentDto.employeeId },
            });
            if (!employee) {
                throw new common_1.NotFoundException('Employee not found');
            }
        }
        const updateData = { ...updateDependentDto };
        if (updateDependentDto.dateOfBirth) {
            updateData.dateOfBirth = new Date(updateDependentDto.dateOfBirth);
        }
        Object.assign(dependent, updateData);
        return this.dependentRepository.save(dependent);
    }
    async remove(id) {
        const dependent = await this.findOne(id);
        await this.dependentRepository.remove(dependent);
    }
    async getActiveDependentsCount(employeeId) {
        return this.dependentRepository.count({
            where: { employeeId, isActive: true },
        });
    }
};
exports.DependentsService = DependentsService;
exports.DependentsService = DependentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dependent_entity_1.Dependent)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        tax_config_service_1.TaxConfigService])
], DependentsService);
//# sourceMappingURL=dependents.service.js.map