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
exports.LeaveService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const leave_request_entity_1 = require("../database/entities/leave-request.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
let LeaveService = class LeaveService {
    constructor(leaveRequestRepository, employeeRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
    }
    async createLeaveRequest(employeeId, createLeaveRequestDto) {
        const employee = await this.employeeRepository.findOne({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const startDate = new Date(new Date(createLeaveRequestDto.startDate).toDateString());
        const endDate = new Date(new Date(createLeaveRequestDto.endDate).toDateString());
        if (endDate < startDate) {
            throw new common_1.BadRequestException('End date must be the same or after start date');
        }
        const today = new Date(new Date().toDateString());
        if (startDate < today) {
            throw new common_1.BadRequestException('Cannot request leave for past dates');
        }
        const timeDiff = endDate.getTime() - startDate.getTime();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
        const leaveRequest = this.leaveRequestRepository.create({
            employeeId,
            type: createLeaveRequestDto.type,
            startDate,
            endDate,
            days,
            reason: createLeaveRequestDto.reason,
            notes: createLeaveRequestDto.notes,
        });
        return this.leaveRequestRepository.save(leaveRequest);
    }
    async findAll() {
        return this.leaveRequestRepository.find({
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByEmployee(employeeId) {
        return this.leaveRequestRepository.find({
            where: { employeeId },
            relations: ['employee'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const leaveRequest = await this.leaveRequestRepository.findOne({
            where: { id },
            relations: ['employee'],
        });
        if (!leaveRequest) {
            throw new common_1.NotFoundException('Leave request not found');
        }
        return leaveRequest;
    }
    async approveLeaveRequest(id, approvedBy) {
        const leaveRequest = await this.findOne(id);
        if (leaveRequest.status !== leave_request_entity_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Leave request is not pending');
        }
        const employee = await this.employeeRepository.findOne({ where: { id: leaveRequest.employeeId } });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const days = Number(leaveRequest.days);
        if (leaveRequest.type === leave_request_entity_1.LeaveType.ANNUAL) {
            if (Number(employee.annualLeaveBalance || 0) < days) {
                throw new common_1.BadRequestException('Not enough annual leave balance');
            }
            employee.annualLeaveBalance = Number(employee.annualLeaveBalance || 0) - days;
        }
        else if (leaveRequest.type === leave_request_entity_1.LeaveType.SICK) {
            if (Number(employee.sickLeaveBalance || 0) < days) {
                throw new common_1.BadRequestException('Not enough sick leave balance');
            }
            employee.sickLeaveBalance = Number(employee.sickLeaveBalance || 0) - days;
        }
        leaveRequest.status = leave_request_entity_1.LeaveStatus.APPROVED;
        leaveRequest.approvedBy = approvedBy;
        leaveRequest.approvedAt = new Date();
        await this.employeeRepository.save(employee);
        return this.leaveRequestRepository.save(leaveRequest);
    }
    async rejectLeaveRequest(id, approvedBy, rejectionReason) {
        const leaveRequest = await this.findOne(id);
        if (leaveRequest.status !== leave_request_entity_1.LeaveStatus.PENDING) {
            throw new common_1.BadRequestException('Leave request is not pending');
        }
        leaveRequest.status = leave_request_entity_1.LeaveStatus.REJECTED;
        leaveRequest.approvedBy = approvedBy;
        leaveRequest.approvedAt = new Date();
        leaveRequest.rejectionReason = rejectionReason;
        return this.leaveRequestRepository.save(leaveRequest);
    }
    async getLeaveRequestsByDateRange(startDate, endDate) {
        return this.leaveRequestRepository.find({
            where: {
                startDate: (0, typeorm_2.Between)(startDate, endDate),
                status: leave_request_entity_1.LeaveStatus.APPROVED,
            },
            relations: ['employee'],
        });
    }
};
exports.LeaveService = LeaveService;
exports.LeaveService = LeaveService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(leave_request_entity_1.LeaveRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LeaveService);
//# sourceMappingURL=leave.service.js.map