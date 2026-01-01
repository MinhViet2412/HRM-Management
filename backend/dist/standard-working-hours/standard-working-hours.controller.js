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
exports.StandardWorkingHoursController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const standard_working_hours_service_1 = require("./standard-working-hours.service");
const create_standard_working_hours_dto_1 = require("./dto/create-standard-working-hours.dto");
const update_standard_working_hours_dto_1 = require("./dto/update-standard-working-hours.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let StandardWorkingHoursController = class StandardWorkingHoursController {
    constructor(standardWorkingHoursService) {
        this.standardWorkingHoursService = standardWorkingHoursService;
    }
    create(createDto) {
        return this.standardWorkingHoursService.create(createDto);
    }
    findAll() {
        return this.standardWorkingHoursService.findAll();
    }
    getByPeriod(period) {
        return this.standardWorkingHoursService.getByPeriod(period);
    }
    getOrCalculate(year, month) {
        return this.standardWorkingHoursService.getOrCalculate(parseInt(year), parseInt(month));
    }
    findOne(id) {
        return this.standardWorkingHoursService.findOne(id);
    }
    update(id, updateDto) {
        return this.standardWorkingHoursService.update(id, updateDto);
    }
    remove(id) {
        return this.standardWorkingHoursService.remove(id);
    }
};
exports.StandardWorkingHoursController = StandardWorkingHoursController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Create standard working hours configuration' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_standard_working_hours_dto_1.CreateStandardWorkingHoursDto]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all standard working hours configurations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('period/:period'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get standard working hours by period (YYYY-MM)' }),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "getByPeriod", null);
__decorate([
    (0, common_1.Get)('calculate/:year/:month'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get or calculate standard working hours for a month' }),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Param)('month')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "getOrCalculate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get standard working hours by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Update standard working hours configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_standard_working_hours_dto_1.UpdateStandardWorkingHoursDto]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete standard working hours configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], StandardWorkingHoursController.prototype, "remove", null);
exports.StandardWorkingHoursController = StandardWorkingHoursController = __decorate([
    (0, swagger_1.ApiTags)('Standard Working Hours'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('standard-working-hours'),
    __metadata("design:paramtypes", [standard_working_hours_service_1.StandardWorkingHoursService])
], StandardWorkingHoursController);
//# sourceMappingURL=standard-working-hours.controller.js.map