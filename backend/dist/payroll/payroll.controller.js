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
exports.PayrollController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payroll_service_1 = require("./payroll.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let PayrollController = class PayrollController {
    constructor(payrollService) {
        this.payrollService = payrollService;
    }
    async generatePayroll(period, employeeId) {
        if (!/^\d{4}-\d{2}$/.test(period)) {
            throw new common_1.BadRequestException('Invalid period format. Expected YYYY-MM');
        }
        try {
            return await this.payrollService.generatePayroll(period, employeeId);
        }
        catch (e) {
            throw new common_1.BadRequestException(e?.message || 'Failed to generate payroll');
        }
    }
    async getPayrollByEmployee(employeeId, period) {
        return this.payrollService.getPayrollByEmployee(employeeId, period);
    }
    async getPayrollByPeriod(period) {
        return this.payrollService.getPayrollByPeriod(period);
    }
    async downloadPayrollPdf(id, res, req) {
        const { stream, filename } = await this.payrollService.generatePayrollPdf(id, req.user);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        stream.pipe(res);
    }
    async approvePayroll(id, req) {
        return this.payrollService.approvePayroll(id, req.user.id);
    }
    async getStandardHours(period) {
        const [year, month] = period.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        const days = this.payrollService['getWorkingDaysInMonth'](date);
        return { period, standardWorkingDays: days, standardWorkingHours: days * 8 };
    }
};
exports.PayrollController = PayrollController;
__decorate([
    (0, common_1.Post)('generate/:period'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Generate payroll for a period' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payroll generated successfully' }),
    __param(0, (0, common_1.Param)('period')),
    __param(1, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "generatePayroll", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll records for an employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll records retrieved successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollByEmployee", null);
__decorate([
    (0, common_1.Get)('period/:period'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll records for a period' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll records retrieved successfully' }),
    __param(0, (0, common_1.Param)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getPayrollByPeriod", null);
__decorate([
    (0, common_1.Get)(':id/pdf'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Download payroll as PDF' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'PDF generated' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "downloadPayrollPdf", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Approve a payroll' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll approved successfully' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "approvePayroll", null);
__decorate([
    (0, common_1.Get)('standard-hours'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get standard working days/hours for a period YYYY-MM' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayrollController.prototype, "getStandardHours", null);
exports.PayrollController = PayrollController = __decorate([
    (0, swagger_1.ApiTags)('Payroll'),
    (0, common_1.Controller)('payroll'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [payroll_service_1.PayrollService])
], PayrollController);
//# sourceMappingURL=payroll.controller.js.map