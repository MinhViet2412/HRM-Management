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
exports.LeaveController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const leave_service_1 = require("./leave.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let LeaveController = class LeaveController {
    constructor(leaveService) {
        this.leaveService = leaveService;
    }
    async createLeaveRequest(req, createLeaveRequestDto) {
        const employeeIdFromToken = req.user.employeeId;
        const employeeIdFromBody = createLeaveRequestDto.employeeId;
        const canActOnBehalf = [role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER].includes(req.user.role);
        const employeeId = employeeIdFromToken || (canActOnBehalf ? employeeIdFromBody : undefined);
        if (!employeeId) {
            throw new common_2.BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
        }
        return this.leaveService.createLeaveRequest(employeeId, createLeaveRequestDto);
    }
    async findAll() {
        return this.leaveService.findAll();
    }
    async getMyLeaveRequests(req, employeeIdQuery) {
        const canActOnBehalf = [role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER].includes(req.user.role);
        const employeeId = req.user.employeeId || (canActOnBehalf ? employeeIdQuery : undefined);
        if (!employeeId) {
            return [];
        }
        return this.leaveService.findByEmployee(employeeId);
    }
    async findOne(id) {
        return this.leaveService.findOne(id);
    }
    async approveLeaveRequest(id, req) {
        return this.leaveService.approveLeaveRequest(id, req.user.id);
    }
    async rejectLeaveRequest(id, rejectionReason, req) {
        return this.leaveService.rejectLeaveRequest(id, req.user.id, rejectionReason);
    }
};
exports.LeaveController = LeaveController;
__decorate([
    (0, common_1.Post)('request'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a leave request' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Leave request created successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "createLeaveRequest", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all leave requests' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave requests retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-requests'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get my leave requests' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave requests retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "getMyLeaveRequests", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get leave request by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave request retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Leave request not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a leave request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave request approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "approveLeaveRequest", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Reject a leave request' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Leave request rejected successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('rejectionReason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LeaveController.prototype, "rejectLeaveRequest", null);
exports.LeaveController = LeaveController = __decorate([
    (0, swagger_1.ApiTags)('Leave Requests'),
    (0, common_1.Controller)('leave'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [leave_service_1.LeaveService])
], LeaveController);
//# sourceMappingURL=leave.controller.js.map