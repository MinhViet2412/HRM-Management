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
exports.ContractTypesController = void 0;
const common_1 = require("@nestjs/common");
const contract_types_service_1 = require("./contract-types.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const swagger_1 = require("@nestjs/swagger");
const role_entity_1 = require("../database/entities/role.entity");
let ContractTypesController = class ContractTypesController {
    constructor(contractTypesService) {
        this.contractTypesService = contractTypesService;
    }
    create(dto) {
        return this.contractTypesService.create(dto);
    }
    findAll() {
        return this.contractTypesService.findAll();
    }
    findOne(id) {
        return this.contractTypesService.findOne(id);
    }
    update(id, dto) {
        return this.contractTypesService.update(id, dto);
    }
    remove(id) {
        return this.contractTypesService.remove(id);
    }
};
exports.ContractTypesController = ContractTypesController;
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateContractTypeDto]),
    __metadata("design:returntype", void 0)
], ContractTypesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContractTypesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractTypesController.prototype, "findOne", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateContractTypeDto]),
    __metadata("design:returntype", void 0)
], ContractTypesController.prototype, "update", null);
__decorate([
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ContractTypesController.prototype, "remove", null);
exports.ContractTypesController = ContractTypesController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiTags)('Contract Types'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('contract-types'),
    __metadata("design:paramtypes", [contract_types_service_1.ContractTypesService])
], ContractTypesController);
//# sourceMappingURL=contract-types.controller.js.map