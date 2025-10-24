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
exports.ResignationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resignations_service_1 = require("./resignations.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
const resignation_request_entity_1 = require("../database/entities/resignation-request.entity");
let ResignationsController = class ResignationsController {
    constructor(service) {
        this.service = service;
    }
    async request(body) {
        return this.service.requestResignation(body.employeeId, body.requestedById, body.effectiveDate, body.reason);
    }
    async approve(id, body) {
        return this.service.approve(id, body.approverId);
    }
    async reject(id, body) {
        return this.service.reject(id, body.approverId);
    }
    async list(status) {
        return this.service.list(status);
    }
};
exports.ResignationsController = ResignationsController;
__decorate([
    (0, common_1.Post)('request'),
    (0, swagger_1.ApiOperation)({ summary: 'Employee/Manager submit resignation request' }),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ResignationsController.prototype, "request", null);
__decorate([
    (0, common_1.Patch)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve resignation request' }),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResignationsController.prototype, "approve", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject resignation request' }),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ResignationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List resignation requests' }),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ResignationsController.prototype, "list", null);
exports.ResignationsController = ResignationsController = __decorate([
    (0, swagger_1.ApiTags)('Resignations'),
    (0, common_1.Controller)('resignations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [resignations_service_1.ResignationsService])
], ResignationsController);
//# sourceMappingURL=resignations.controller.js.map