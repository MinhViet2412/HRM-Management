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
exports.LeaveLimitConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const leave_limit_config_service_1 = require("./leave-limit-config.service");
const create_leave_limit_config_dto_1 = require("./dto/create-leave-limit-config.dto");
const update_leave_limit_config_dto_1 = require("./dto/update-leave-limit-config.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let LeaveLimitConfigController = class LeaveLimitConfigController {
    constructor(leaveLimitConfigService) {
        this.leaveLimitConfigService = leaveLimitConfigService;
    }
    create(createDto) {
        return this.leaveLimitConfigService.create(createDto);
    }
    findAll(year) {
        if (year) {
            return this.leaveLimitConfigService.findByYear(parseInt(year));
        }
        return this.leaveLimitConfigService.findAll();
    }
    findOne(id) {
        return this.leaveLimitConfigService.findOne(id);
    }
    update(id, updateDto) {
        return this.leaveLimitConfigService.update(id, updateDto);
    }
    remove(id) {
        return this.leaveLimitConfigService.remove(id);
    }
};
exports.LeaveLimitConfigController = LeaveLimitConfigController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new leave limit configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_leave_limit_config_dto_1.CreateLeaveLimitConfigDto]),
    __metadata("design:returntype", void 0)
], LeaveLimitConfigController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all leave limit configurations' }),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveLimitConfigController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a leave limit configuration by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveLimitConfigController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Update a leave limit configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_leave_limit_config_dto_1.UpdateLeaveLimitConfigDto]),
    __metadata("design:returntype", void 0)
], LeaveLimitConfigController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a leave limit configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LeaveLimitConfigController.prototype, "remove", null);
exports.LeaveLimitConfigController = LeaveLimitConfigController = __decorate([
    (0, swagger_1.ApiTags)('Leave Limit Config'),
    (0, common_1.Controller)('leave-limit-config'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [leave_limit_config_service_1.LeaveLimitConfigService])
], LeaveLimitConfigController);
//# sourceMappingURL=leave-limit-config.controller.js.map