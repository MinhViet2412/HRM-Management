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
exports.ResignationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const resignation_request_entity_1 = require("../database/entities/resignation-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const user_entity_1 = require("../database/entities/user.entity");
let ResignationsService = class ResignationsService {
    constructor(resignationRepo, employeeRepo, userRepo) {
        this.resignationRepo = resignationRepo;
        this.employeeRepo = employeeRepo;
        this.userRepo = userRepo;
    }
    async requestResignation(employeeId, requestedById, effectiveDate, reason) {
        const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        if (new Date(effectiveDate) < new Date(new Date().toDateString())) {
            throw new common_1.BadRequestException('Effective date must be today or later');
        }
        const req = this.resignationRepo.create({ employeeId, requestedById, effectiveDate: new Date(effectiveDate), reason });
        return this.resignationRepo.save(req);
    }
    async approve(id, approverId) {
        const req = await this.resignationRepo.findOne({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Resignation request not found');
        req.status = resignation_request_entity_1.ResignationStatus.APPROVED;
        req.approvedById = approverId;
        req.approvedAt = new Date();
        return this.resignationRepo.save(req);
    }
    async reject(id, approverId) {
        const req = await this.resignationRepo.findOne({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Resignation request not found');
        req.status = resignation_request_entity_1.ResignationStatus.REJECTED;
        req.approvedById = approverId;
        req.approvedAt = new Date();
        return this.resignationRepo.save(req);
    }
    async list(status) {
        return this.resignationRepo.find({ where: status ? { status } : {}, relations: ['employee'] });
    }
    async processEffectiveResignations(today = new Date()) {
        const dateOnly = new Date(today.toDateString());
        const due = await this.resignationRepo.find({ where: { status: resignation_request_entity_1.ResignationStatus.APPROVED }, relations: ['employee'] });
        const updated = [];
        for (const req of due) {
            if (new Date(req.effectiveDate.toDateString()).getTime() <= dateOnly.getTime()) {
                const employee = await this.employeeRepo.findOne({ where: { id: req.employeeId }, relations: ['user'] });
                if (employee) {
                    employee.status = employee_entity_1.EmployeeStatus.TERMINATED;
                    employee.terminationDate = dateOnly;
                    await this.employeeRepo.save(employee);
                    if (employee.user) {
                        employee.user.status = user_entity_1.UserStatus.INACTIVE;
                        await this.userRepo.save(employee.user);
                    }
                }
                req.status = resignation_request_entity_1.ResignationStatus.PROCESSED;
                await this.resignationRepo.save(req);
                updated.push(req.id);
            }
        }
        return { processed: updated.length };
    }
};
exports.ResignationsService = ResignationsService;
exports.ResignationsService = ResignationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(resignation_request_entity_1.ResignationRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ResignationsService);
//# sourceMappingURL=resignations.service.js.map