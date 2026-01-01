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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const common_2 = require("@nestjs/common");
const attendance_service_1 = require("./attendance.service");
const adjust_attendance_dto_1 = require("./dto/adjust-attendance.dto");
const manual_attendance_dto_1 = require("./dto/manual-attendance.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let AttendanceController = class AttendanceController {
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async checkIn(req, checkInDto) {
        const canActOnBehalf = [role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER].includes(req.user.role);
        const employeeId = req.user.employeeId || (canActOnBehalf ? checkInDto.employeeId : undefined);
        if (!employeeId) {
            throw new common_2.BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
        }
        return this.attendanceService.checkIn(employeeId, checkInDto);
    }
    async checkOut(req, checkOutDto) {
        const canActOnBehalf = [role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER].includes(req.user.role);
        const employeeId = req.user.employeeId || (canActOnBehalf ? checkOutDto.employeeId : undefined);
        if (!employeeId) {
            throw new common_2.BadRequestException('Employee ID not found. Provide employeeId in body or use an employee account');
        }
        return this.attendanceService.checkOut(employeeId, checkOutDto);
    }
    async getMyAttendance(req, startDate, endDate, employeeIdQuery) {
        const canActOnBehalf = [role_entity_1.RoleName.ADMIN, role_entity_1.RoleName.HR, role_entity_1.RoleName.MANAGER].includes(req.user.role);
        const employeeId = req.user.employeeId || (canActOnBehalf ? employeeIdQuery : undefined);
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        if (!employeeId) {
            return [];
        }
        return this.attendanceService.getAttendanceByEmployee(employeeId, start, end);
    }
    async getEmployeeAttendance(employeeId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return this.attendanceService.getAttendanceByEmployee(employeeId, start, end);
    }
    async getAttendanceByDate(date) {
        return this.attendanceService.getAttendanceByDate(new Date(date));
    }
    async getAttendanceWithFilters(startDate, endDate, departmentId) {
        const start = startDate ? new Date(startDate + 'T00:00:00') : new Date();
        const end = endDate ? new Date(endDate + 'T23:59:59') : new Date();
        return this.attendanceService.getAttendanceWithFilters(start, end, departmentId);
    }
    async closeMissingCheckout(employeeId, date, req) {
        return this.attendanceService.closeMissingCheckout(employeeId, new Date(date), req.user.id);
    }
    async getAttendanceSummary(employeeId, startDate, endDate) {
        return this.attendanceService.getAttendanceSummary(employeeId, new Date(startDate), new Date(endDate));
    }
    async adjustAttendance(attendanceId, adjustDto, req) {
        return this.attendanceService.adjustAttendance(attendanceId, adjustDto, req.user.id);
    }
    async manualUpsert(body, req) {
        return this.attendanceService.manualUpsert(body, req.user.id);
    }
    async testCalculation(testData) {
        return this.attendanceService.testWorkingHoursCalculation(testData.checkIn, testData.checkOut, testData.shiftId);
    }
    async testRules(testData) {
        return this.attendanceService.testAttendanceRules(testData.checkIn ? new Date(testData.checkIn) : null, testData.checkOut ? new Date(testData.checkOut) : null);
    }
    async getRules() {
        return this.attendanceService.getAllAttendanceRules();
    }
    async reEvaluateAttendance(filterData) {
        return this.attendanceService.reEvaluateAttendanceRecords(filterData.startDate ? new Date(filterData.startDate) : undefined, filterData.endDate ? new Date(filterData.endDate) : undefined, filterData.departmentId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('check-in'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Check in for the day' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Check-in successful' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Already checked in today' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkIn", null);
__decorate([
    (0, common_1.Post)('check-out'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Check out for the day' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Check-out successful' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Already checked out today' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkOut", null);
__decorate([
    (0, common_1.Get)('my-attendance'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.EMPLOYEE, role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get my attendance records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance records retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: Date }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __param(3, (0, common_1.Query)('employeeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Get)('employee/:employeeId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee attendance records' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance records retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, type: Date }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getEmployeeAttendance", null);
__decorate([
    (0, common_1.Get)('date/:date'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records for a specific date' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance records retrieved successfully' }),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceByDate", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance records with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance records retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: false, description: 'Start date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: false, description: 'End date (YYYY-MM-DD)' }),
    (0, swagger_1.ApiQuery)({ name: 'departmentId', required: false, description: 'Department ID filter' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('departmentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceWithFilters", null);
__decorate([
    (0, common_1.Post)('close-missing-checkout/:employeeId/:date'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Close missing checkout for an employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Missing checkout closed successfully' }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Param)('date')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "closeMissingCheckout", null);
__decorate([
    (0, common_1.Get)('summary/:employeeId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get attendance summary for an employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance summary retrieved successfully' }),
    (0, swagger_1.ApiQuery)({ name: 'startDate', required: true, type: Date }),
    (0, swagger_1.ApiQuery)({ name: 'endDate', required: true, type: Date }),
    __param(0, (0, common_1.Param)('employeeId')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getAttendanceSummary", null);
__decorate([
    (0, common_1.Patch)('adjust/:attendanceId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Adjust attendance times and status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance adjusted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Attendance record not found' }),
    __param(0, (0, common_1.Param)('attendanceId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, adjust_attendance_dto_1.AdjustAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "adjustAttendance", null);
__decorate([
    (0, common_1.Post)('manual'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create or update attendance manually for any date' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Attendance upserted successfully' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [manual_attendance_dto_1.ManualAttendanceDto, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "manualUpsert", null);
__decorate([
    (0, common_1.Post)('test-calculation'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test working hours calculation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Calculation test completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "testCalculation", null);
__decorate([
    (0, common_1.Post)('test-rules'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Test attendance rules evaluation' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rules evaluation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "testRules", null);
__decorate([
    (0, common_1.Get)('rules'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attendance rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Rules retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getRules", null);
__decorate([
    (0, common_1.Post)('re-evaluate'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleName.MANAGER, role_entity_1.RoleName.HR, role_entity_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Re-evaluate all attendance records with updated rules' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Re-evaluation completed' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "reEvaluateAttendance", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance'),
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map