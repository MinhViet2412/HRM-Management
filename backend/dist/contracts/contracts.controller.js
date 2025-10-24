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
exports.ContractsController = void 0;
const common_1 = require("@nestjs/common");
const contracts_service_1 = require("./contracts.service");
const dto_1 = require("./dto");
const contract_types_service_1 = require("../contract-types/contract-types.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const role_entity_1 = require("../database/entities/role.entity");
let ContractsController = class ContractsController {
    constructor(contractsService, contractTypesService) {
        this.contractsService = contractsService;
        this.contractTypesService = contractTypesService;
    }
    create(dto) {
        return this.contractsService.createContract(dto);
    }
    findAll(req) {
        const user = req.user;
        return this.contractsService.getContracts({
            role: user?.role?.name || user?.role,
            employeeId: user?.employeeId || user?.employee?.id,
            departmentId: user?.employee?.departmentId,
        });
    }
    findTypes() {
        return this.contractTypesService.findAll();
    }
    createTemplate(dto) {
        return this.contractsService.createTemplate(dto);
    }
    findTemplates() {
        return this.contractsService.getTemplates();
    }
    updateTemplate(id, dto) {
        return this.contractsService.updateTemplate(id, dto);
    }
    removeTemplate(id) {
        return this.contractsService.deleteTemplate(id);
    }
    findOne(id, req) {
        const user = req.user;
        return this.contractsService.getContract(id, {
            role: user?.role?.name || user?.role,
            employeeId: user?.employeeId || user?.employee?.id,
            departmentId: user?.employee?.departmentId,
        });
    }
    update(id, dto) {
        return this.contractsService.updateContract(id, dto);
    }
    remove(id) {
        return this.contractsService.deleteContract(id);
    }
    approve(id) {
        return this.contractsService.approveContract(id);
    }
    reject(id, reason) {
        return this.contractsService.rejectContract(id, reason);
    }
};
exports.ContractsController = ContractsController;
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('types'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findTypes", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER),
    (0, common_1.Post)('templates'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateContractTemplateDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "createTemplate", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Get)('templates'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findTemplates", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER),
    (0, common_1.Patch)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateContractTemplateDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "updateTemplate", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER),
    (0, common_1.Delete)('templates/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "removeTemplate", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateContractDto]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "remove", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "approve", null);
__decorate([
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ContractsController.prototype, "reject", null);
exports.ContractsController = ContractsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiTags)('Contracts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contracts'),
    __metadata("design:paramtypes", [contracts_service_1.ContractsService,
        contract_types_service_1.ContractTypesService])
], ContractsController);
//# sourceMappingURL=contracts.controller.js.map