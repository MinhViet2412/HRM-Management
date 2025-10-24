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
exports.PayslipsController = void 0;
const common_1 = require("@nestjs/common");
const payslips_service_1 = require("./payslips.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let PayslipsController = class PayslipsController {
    constructor(payslipsService) {
        this.payslipsService = payslipsService;
    }
    list(period) {
        return this.payslipsService.list(period);
    }
    listMine(req, period) {
        const employeeId = req.user.employeeId;
        if (!employeeId)
            return [];
        return this.payslipsService.listByEmployee(employeeId, period);
    }
    get(id) {
        return this.payslipsService.get(id);
    }
    bulkCreate(period, employeeIds) {
        return this.payslipsService.bulkCreate(period, employeeIds);
    }
    remove(id) {
        return this.payslipsService.remove(id);
    }
    updateStatus(id, status) {
        return this.payslipsService.updateStatus(id, status);
    }
};
exports.PayslipsController = PayslipsController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "listMine", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)('bulk-create/:period'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    __param(0, (0, common_1.Param)('period')),
    __param(1, (0, common_1.Body)('employeeIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PayslipsController.prototype, "updateStatus", null);
exports.PayslipsController = PayslipsController = __decorate([
    (0, common_1.Controller)('payslips'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [payslips_service_1.PayslipsService])
], PayslipsController);
//# sourceMappingURL=payslips.controller.js.map