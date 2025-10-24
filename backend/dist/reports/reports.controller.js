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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async getAttendanceSummary(startDate, endDate, departmentId) {
        return this.reportsService.getAttendanceSummary(new Date(startDate), new Date(endDate), departmentId);
    }
    async getStaffingByDepartment() {
        return this.reportsService.getStaffingByDepartment();
    }
    async getPayrollSummary(period) {
        return this.reportsService.getPayrollSummary(period);
    }
    async getEmployeePerformance(employeeId, startDate, endDate) {
        return this.reportsService.getEmployeePerformance(employeeId, new Date(startDate), new Date(endDate));
    }
    async getPersonnelTurnover(startDate, endDate, departmentId) {
        return this.reportsService.getPersonnelTurnover(new Date(startDate), new Date(endDate), departmentId);
    }
    async exportAttendanceSummary(startDate, endDate, res, departmentId) {
        const buffer = await this.reportsService.exportAttendanceSummaryToExcel(new Date(startDate), new Date(endDate), departmentId);
        const filename = `attendance-summary-${startDate}-to-${endDate}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    async exportPayrollSummary(period, res) {
        const buffer = await this.reportsService.exportPayrollSummaryToExcel(period);
        const filename = `payroll-summary-${period}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    async exportPersonnelTurnover(startDate, endDate, res, departmentId) {
        const buffer = await this.reportsService.exportPersonnelTurnoverToExcel(new Date(startDate), new Date(endDate), departmentId);
        const filename = `personnel-turnover-${startDate}-to-${endDate}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    async exportStaffingByDepartment(res) {
        const buffer = await this.reportsService.exportStaffingByDepartmentToExcel();
        const filename = `staffing-by-department-${new Date().toISOString().split('T')[0]}.xlsx`;
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('attendance-summary'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance summary report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance summary retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Get)('staffing-by-department'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get staffing report by department' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Staffing report retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getStaffingByDepartment", null);
__decorate([
    (0, common_1.Get)('payroll-summary'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get payroll summary report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payroll summary retrieved successfully' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPayrollSummary", null);
__decorate([
    (0, common_1.Get)('employee-performance/:employeeId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee performance report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Employee performance report retrieved successfully' }),
    __param(0, (0, common_1.Query)('employeeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getEmployeePerformance", null);
__decorate([
    (0, common_1.Get)('personnel-turnover'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get personnel turnover report' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Personnel turnover report retrieved successfully' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPersonnelTurnover", null);
__decorate([
    (0, common_1.Get)('export/attendance-summary'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export attendance summary to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file generated successfully' }),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="attendance-summary.xlsx"'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportAttendanceSummary", null);
__decorate([
    (0, common_1.Get)('export/payroll-summary'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Export payroll summary to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file generated successfully' }),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="payroll-summary.xlsx"'),
    __param(0, (0, common_1.Query)('period')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportPayrollSummary", null);
__decorate([
    (0, common_1.Get)('export/personnel-turnover'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export personnel turnover to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file generated successfully' }),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="personnel-turnover.xlsx"'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportPersonnelTurnover", null);
__decorate([
    (0, common_1.Get)('export/staffing-by-department'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Export staffing by department to Excel' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Excel file generated successfully' }),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="staffing-by-department.xlsx"'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "exportStaffingByDepartment", null);
exports.ReportsController = ReportsController = __decorate([
    (0, swagger_1.ApiTags)('Reports'),
    (0, common_1.Controller)('reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map