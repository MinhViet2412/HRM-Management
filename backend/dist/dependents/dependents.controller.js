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
exports.DependentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dependents_service_1 = require("./dependents.service");
const create_dependent_dto_1 = require("./dto/create-dependent.dto");
const update_dependent_dto_1 = require("./dto/update-dependent.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let DependentsController = class DependentsController {
    constructor(dependentsService) {
        this.dependentsService = dependentsService;
    }
    create(createDependentDto) {
        return this.dependentsService.create(createDependentDto);
    }
    findAll(employeeId) {
        return this.dependentsService.findAll(employeeId);
    }
    findByEmployeeId(employeeId) {
        return this.dependentsService.findByEmployeeId(employeeId);
    }
    getActiveCount(employeeId) {
        return this.dependentsService.getActiveDependentsCount(employeeId);
    }
    findOne(id) {
        return this.dependentsService.findOne(id);
    }
    update(id, updateDependentDto) {
        return this.dependentsService.update(id, updateDependentDto);
    }
    remove(id) {
        return this.dependentsService.remove(id);
    }
};
exports.DependentsController = DependentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new dependent' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_dependent_dto_1.CreateDependentDto]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all dependents' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all dependents for an employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "findByEmployeeId", null);
__decorate([
    (0, common_1.Get)('count/:employeeId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get count of active dependents for an employee' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "getActiveCount", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a dependent by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a dependent' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_dependent_dto_1.UpdateDependentDto]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a dependent' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DependentsController.prototype, "remove", null);
exports.DependentsController = DependentsController = __decorate([
    (0, swagger_1.ApiTags)('Dependents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dependents'),
    __metadata("design:paramtypes", [dependents_service_1.DependentsService])
], DependentsController);
//# sourceMappingURL=dependents.controller.js.map