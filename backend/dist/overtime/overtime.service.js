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
exports.OvertimeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const overtime_request_entity_1 = require("../database/entities/overtime-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let OvertimeService = class OvertimeService {
    constructor(overtimeRepo, employeeRepo) {
        this.overtimeRepo = overtimeRepo;
        this.employeeRepo = employeeRepo;
    }
    async create(employeeUserId, employeeId, dto) {
        const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
        if (!employee)
            throw new common_1.NotFoundException('Employee not found');
        const hours = this.computeHours(dto.startTime, dto.endTime);
        if (hours <= 0)
            throw new common_1.BadRequestException('Invalid OT duration');
        const request = this.overtimeRepo.create({
            employeeId,
            date: dto.date,
            startTime: dto.startTime,
            endTime: dto.endTime,
            hours,
            reason: dto.reason || null,
            status: overtime_request_entity_1.OvertimeStatus.PENDING,
            approverId: dto.approverId || null,
        });
        return this.overtimeRepo.save(request);
    }
    async listMy(employeeId) {
        return this.overtimeRepo.find({ where: { employeeId }, order: { date: 'DESC' } });
    }
    async listAssigned(approverId) {
        return this.overtimeRepo.find({
            where: [
                { approverId },
                { approverId: null, status: overtime_request_entity_1.OvertimeStatus.PENDING },
            ],
            order: { createdAt: 'DESC' },
        });
    }
    async assignApprover(id, approverId) {
        const req = await this.overtimeRepo.findOne({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('OT request not found');
        if (req.status !== overtime_request_entity_1.OvertimeStatus.PENDING)
            throw new common_1.BadRequestException('Only pending can be assigned');
        req.approverId = approverId;
        return this.overtimeRepo.save(req);
    }
    async approve(id, approverId, dto) {
        const req = await this.overtimeRepo.findOne({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('OT request not found');
        if (req.status !== overtime_request_entity_1.OvertimeStatus.PENDING)
            throw new common_1.BadRequestException('Request not pending');
        if (req.approverId && req.approverId !== approverId)
            throw new common_1.BadRequestException('Not assigned to this approver');
        req.status = overtime_request_entity_1.OvertimeStatus.APPROVED;
        req.approverId = approverId;
        req.approvedAt = new Date();
        return this.overtimeRepo.save(req);
    }
    async reject(id, approverId, reason) {
        const req = await this.overtimeRepo.findOne({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('OT request not found');
        if (req.status !== overtime_request_entity_1.OvertimeStatus.PENDING)
            throw new common_1.BadRequestException('Request not pending');
        if (req.approverId && req.approverId !== approverId)
            throw new common_1.BadRequestException('Not assigned to this approver');
        req.status = overtime_request_entity_1.OvertimeStatus.REJECTED;
        req.approverId = approverId;
        req.rejectionReason = reason || null;
        req.approvedAt = new Date();
        return this.overtimeRepo.save(req);
    }
    computeHours(start, end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const startMin = sh * 60 + sm;
        const endMin = eh * 60 + em;
        const diff = endMin - startMin;
        return Math.round((diff / 60) * 100) / 100;
    }
};
exports.OvertimeService = OvertimeService;
exports.OvertimeService = OvertimeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(overtime_request_entity_1.OvertimeRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OvertimeService);
//# sourceMappingURL=overtime.service.js.map