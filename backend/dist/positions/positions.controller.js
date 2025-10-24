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
exports.PositionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const positions_service_1 = require("./positions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let PositionsController = class PositionsController {
    constructor(positionsService) {
        this.positionsService = positionsService;
    }
    async create(createPositionDto) {
        return this.positionsService.create(createPositionDto);
    }
    async findAll() {
        return this.positionsService.findAll();
    }
    async findOne(id) {
        return this.positionsService.findOne(id);
    }
    async update(id, updatePositionDto) {
        return this.positionsService.update(id, updatePositionDto);
    }
    async remove(id) {
        await this.positionsService.remove(id);
        return { message: 'Position deleted successfully' };
    }
};
exports.PositionsController = PositionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new position' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Position created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all positions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Positions retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get position by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Position not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Update position' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position updated successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete position' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Position deleted successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PositionsController.prototype, "remove", null);
exports.PositionsController = PositionsController = __decorate([
    (0, swagger_1.ApiTags)('Positions'),
    (0, common_1.Controller)('positions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [positions_service_1.PositionsService])
], PositionsController);
//# sourceMappingURL=positions.controller.js.map