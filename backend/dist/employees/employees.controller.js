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
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const employees_service_1 = require("./employees.service");
const create_employee_dto_1 = require("./dto/create-employee.dto");
const update_employee_dto_1 = require("./dto/update-employee.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const role_entity_1 = require("../database/entities/role.entity");
let EmployeesController = class EmployeesController {
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async create(createEmployeeDto) {
        return this.employeesService.create(createEmployeeDto);
    }
    async uploadAvatar(id, file) {
        return this.employeesService.updateAvatar(id, file.filename);
    }
    async findAll(active) {
        if (active) {
            return this.employeesService.getActiveEmployees();
        }
        return this.employeesService.findAll();
    }
    async findOne(id) {
        return this.employeesService.findOne(id);
    }
    async findByCode(code) {
        return this.employeesService.findByCode(code);
    }
    async update(id, updateEmployeeDto) {
        return this.employeesService.update(id, updateEmployeeDto);
    }
    async remove(id) {
        await this.employeesService.remove(id);
        return { message: 'Employee deleted successfully' };
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new employee' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Employee created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Employee code or email already exists' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_employee_dto_1.CreateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upload-avatar/:id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.EMPLOYEE),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + (0, path_1.extname)(file.originalname));
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "uploadAvatar", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get all employees' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employees retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'active', required: false, type: Boolean }),
    __param(0, (0, common_1.Query)('active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Boolean]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employee not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee by employee code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employee not found' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.EMPLOYEE),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employee not found' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_employee_dto_1.UpdateEmployeeDto]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR),
    (0, swagger_1.ApiOperation)({ summary: 'Delete employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Employee not found' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "remove", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, swagger_1.ApiTags)('Employees'),
    (0, common_1.Controller)('employees'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map