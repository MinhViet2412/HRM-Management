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
exports.OvertimeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const overtime_service_1 = require("./overtime.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
const create_overtime_dto_1 = require("./dto/create-overtime.dto");
const approve_overtime_dto_1 = require("./dto/approve-overtime.dto");
let OvertimeController = class OvertimeController {
    constructor(overtimeService) {
        this.overtimeService = overtimeService;
    }
    create(dto, req) {
        return this.overtimeService.create(req.user.id, req.user.employeeId, dto);
    }
    listMy(req) {
        return this.overtimeService.listMy(req.user.employeeId);
    }
    listAssigned(req) {
        return this.overtimeService.listAssigned(req.user.id);
    }
    approve(id, dto, req) {
        return this.overtimeService.approve(id, req.user.id, dto);
    }
    reject(id, reason, req) {
        return this.overtimeService.reject(id, req.user.id, reason);
    }
};
exports.OvertimeController = OvertimeController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Employee creates an OT request' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_overtime_dto_1.CreateOvertimeDto, Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'List my OT requests' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "listMy", null);
__decorate([
    (0, common_1.Get)('assigned'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'List OT requests assigned to me (approver)' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "listAssigned", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Approve an OT request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, approve_overtime_dto_1.ApproveOvertimeDto, Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Reject an OT request' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('reason')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], OvertimeController.prototype, "reject", null);
exports.OvertimeController = OvertimeController = __decorate([
    (0, swagger_1.ApiTags)('Overtime Requests'),
    (0, common_1.Controller)('overtime'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [overtime_service_1.OvertimeService])
], OvertimeController);
//# sourceMappingURL=overtime.controller.js.map