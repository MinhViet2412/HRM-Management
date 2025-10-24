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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../database/entities/employee.entity");
const department_entity_1 = require("../database/entities/department.entity");
const attendance_entity_1 = require("../database/entities/attendance.entity");
const payroll_entity_1 = require("../database/entities/payroll.entity");
const XLSX = require("xlsx");
let ReportsService = class ReportsService {
    constructor(employeeRepository, departmentRepository, attendanceRepository, payrollRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.payrollRepository = payrollRepository;
    }
    async getAttendanceSummary(startDate, endDate, departmentId) {
        const query = {
            date: (0, typeorm_2.Between)(startDate, endDate),
        };
        const attendances = await this.attendanceRepository.find({
            where: query,
            relations: ['employee', 'employee.department'],
        });
        const filteredAttendances = departmentId
            ? attendances.filter(a => a.employee.departmentId === departmentId)
            : attendances;
        const toNumber = (value) => {
            if (typeof value === 'number')
                return value;
            const parsed = parseFloat(value ?? '0');
            return Number.isNaN(parsed) ? 0 : parsed;
        };
        const summary = {
            totalEmployees: new Set(filteredAttendances.map(a => a.employeeId)).size,
            totalDays: filteredAttendances.length,
            presentDays: filteredAttendances.filter(a => a.status === 'present').length,
            lateDays: filteredAttendances.filter(a => a.status === 'late').length,
            absentDays: filteredAttendances.filter(a => a.status === 'absent').length,
            totalWorkingHours: filteredAttendances.reduce((sum, a) => sum + toNumber(a.workingHours || 0), 0),
            totalOvertimeHours: filteredAttendances.reduce((sum, a) => sum + toNumber(a.overtimeHours || 0), 0),
        };
        return summary;
    }
    async getStaffingByDepartment() {
        const departments = await this.departmentRepository.find({
            relations: ['employees'],
        });
        return departments.map(dept => ({
            departmentId: dept.id,
            departmentName: dept.name,
            totalEmployees: dept.employees.length,
            activeEmployees: dept.employees.filter(emp => emp.status === 'active').length,
        }));
    }
    async getPayrollSummary(period) {
        const payrolls = await this.payrollRepository.find({
            where: { period },
            relations: ['employee'],
        });
        const summary = {
            period,
            totalEmployees: payrolls.length,
            totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
            totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
            totalTax: payrolls.reduce((sum, p) => sum + p.tax, 0),
            totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
            averageSalary: payrolls.length > 0 ? payrolls.reduce((sum, p) => sum + p.netSalary, 0) / payrolls.length : 0,
        };
        return summary;
    }
    async getEmployeePerformance(employeeId, startDate, endDate) {
        const attendances = await this.attendanceRepository.find({
            where: {
                employeeId,
                date: (0, typeorm_2.Between)(startDate, endDate),
            },
        });
        const payrolls = await this.payrollRepository.find({
            where: {
                employeeId,
                period: (0, typeorm_2.Between)(startDate.toISOString().slice(0, 7), endDate.toISOString().slice(0, 7)),
            },
        });
        return {
            employeeId,
            period: { startDate, endDate },
            attendance: {
                totalDays: attendances.length,
                presentDays: attendances.filter(a => a.status === 'present').length,
                lateDays: attendances.filter(a => a.status === 'late').length,
                absentDays: attendances.filter(a => a.status === 'absent').length,
                attendanceRate: attendances.length > 0 ? (attendances.filter(a => a.status === 'present').length / attendances.length) * 100 : 0,
            },
            payroll: {
                totalPeriods: payrolls.length,
                averageSalary: payrolls.length > 0 ? payrolls.reduce((sum, p) => sum + p.netSalary, 0) / payrolls.length : 0,
            },
        };
    }
    async getPersonnelTurnover(startDate, endDate, departmentId) {
        const employees = await this.employeeRepository.find({
            relations: ['department'],
        });
        console.log('Total employees found:', employees.length);
        console.log('Date range:', startDate, 'to', endDate);
        console.log('Employee statuses:', employees.map(emp => ({ id: emp.id, status: emp.status, hireDate: emp.hireDate, terminationDate: emp.terminationDate })));
        const allActiveEmployees = employees.filter(emp => emp.status === 'active');
        console.log('All active employees:', allActiveEmployees.length);
        console.log('Active employee details:', allActiveEmployees.map(emp => ({ id: emp.id, name: `${emp.firstName} ${emp.lastName}`, status: emp.status })));
        const filteredEmployees = departmentId
            ? employees.filter(emp => emp.departmentId === departmentId)
            : employees;
        const hires = filteredEmployees.filter(emp => {
            const hireDate = emp.hireDate;
            if (!hireDate)
                return false;
            const empHireDate = new Date(hireDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            return empHireDate >= start && empHireDate <= end;
        });
        const departures = filteredEmployees.filter(emp => {
            if (emp.terminationDate) {
                const empTerminationDate = new Date(emp.terminationDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return empTerminationDate >= start && empTerminationDate <= end;
            }
            return emp.status === 'terminated';
        });
        const activeEmployees = filteredEmployees.filter(emp => emp.status === 'active');
        const averageHeadcount = activeEmployees.length;
        const turnoverRate = averageHeadcount > 0 ? (departures.length / averageHeadcount) * 100 : 0;
        const departmentStats = {};
        filteredEmployees.forEach(emp => {
            const deptName = emp.department?.name || 'Không xác định';
            if (!departmentStats[deptName]) {
                departmentStats[deptName] = {
                    departmentName: deptName,
                    hires: 0,
                    departures: 0,
                    netChange: 0,
                    currentActive: 0,
                };
            }
            if (emp.hireDate) {
                const empHireDate = new Date(emp.hireDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (empHireDate >= start && empHireDate <= end) {
                    departmentStats[deptName].hires++;
                }
            }
            if (emp.terminationDate) {
                const empTerminationDate = new Date(emp.terminationDate);
                const start = new Date(startDate);
                const end = new Date(endDate);
                if (empTerminationDate >= start && empTerminationDate <= end) {
                    departmentStats[deptName].departures++;
                }
            }
            else if (emp.status === 'terminated') {
                departmentStats[deptName].departures++;
            }
            if (emp.status === 'active') {
                departmentStats[deptName].currentActive++;
            }
        });
        Object.values(departmentStats).forEach((dept) => {
            dept.netChange = dept.hires - dept.departures;
        });
        const allTerminatedEmployees = filteredEmployees.filter(emp => emp.status === 'terminated');
        return {
            period: { startDate, endDate },
            summary: {
                totalHires: hires.length,
                totalDepartures: departures.length,
                netChange: hires.length - departures.length,
                currentActiveEmployees: activeEmployees.length,
                turnoverRate: Math.round(turnoverRate * 100) / 100,
                terminatedEmployees: allTerminatedEmployees.length,
                terminatedInPeriod: departures.length,
            },
            byDepartment: Object.values(departmentStats),
            terminatedEmployees: allTerminatedEmployees.map(emp => ({
                id: emp.id,
                employeeCode: emp.employeeCode,
                firstName: emp.firstName,
                lastName: emp.lastName,
                department: emp.department?.name || 'Không xác định',
                hireDate: emp.hireDate,
                terminationDate: emp.terminationDate,
                status: emp.status,
            })),
        };
    }
    async exportAttendanceSummaryToExcel(startDate, endDate, departmentId) {
        const summary = await this.getAttendanceSummary(startDate, endDate, departmentId);
        const query = {
            date: (0, typeorm_2.Between)(startDate, endDate),
        };
        const attendances = await this.attendanceRepository.find({
            where: query,
            relations: ['employee', 'employee.department'],
        });
        const filteredAttendances = departmentId
            ? attendances.filter(a => a.employee.departmentId === departmentId)
            : attendances;
        const workbook = XLSX.utils.book_new();
        const summaryData = [
            ['BÁO CÁO TỔNG QUAN CHẤM CÔNG'],
            [`Từ ngày: ${startDate.toLocaleDateString('vi-VN')} - Đến ngày: ${endDate.toLocaleDateString('vi-VN')}`],
            [''],
            ['Tổng nhân viên', summary.totalEmployees],
            ['Tổng ngày chấm công', summary.totalDays],
            ['Ngày có mặt', summary.presentDays],
            ['Ngày đi muộn', summary.lateDays],
            ['Ngày vắng mặt', summary.absentDays],
            ['Tổng giờ làm việc', summary.totalWorkingHours],
            ['Tổng giờ làm thêm', summary.totalOvertimeHours],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');
        const detailData = [
            ['Mã NV', 'Họ tên', 'Phòng ban', 'Ngày', 'Trạng thái', 'Giờ vào', 'Giờ ra', 'Giờ làm việc', 'Giờ làm thêm', 'Ghi chú']
        ];
        filteredAttendances.forEach(attendance => {
            detailData.push([
                attendance.employee?.employeeCode || '',
                `${attendance.employee?.firstName || ''} ${attendance.employee?.lastName || ''}`,
                attendance.employee?.department?.name || '',
                attendance.date.toLocaleDateString('vi-VN'),
                attendance.status,
                attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString('vi-VN') : '',
                attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString('vi-VN') : '',
                String(attendance.workingHours || 0),
                String(attendance.overtimeHours || 0),
                attendance.notes || ''
            ]);
        });
        const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết chấm công');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportPayrollSummaryToExcel(period) {
        const summary = await this.getPayrollSummary(period);
        const payrolls = await this.payrollRepository.find({
            where: { period },
            relations: ['employee', 'employee.department'],
        });
        const workbook = XLSX.utils.book_new();
        const summaryData = [
            ['BÁO CÁO TỔNG QUAN LƯƠNG'],
            [`Kỳ lương: ${period}`],
            [''],
            ['Tổng nhân viên', summary.totalEmployees],
            ['Tổng lương gross', summary.totalGrossSalary],
            ['Tổng lương net', summary.totalNetSalary],
            ['Tổng thuế', summary.totalTax],
            ['Tổng khấu trừ', summary.totalDeductions],
            ['Lương trung bình', summary.averageSalary],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');
        const detailData = [
            ['Mã NV', 'Họ tên', 'Phòng ban', 'Lương cơ bản', 'Phụ cấp', 'Lương gross', 'Thuế', 'Khấu trừ', 'Lương net']
        ];
        payrolls.forEach(payroll => {
            detailData.push([
                payroll.employee?.employeeCode || '',
                `${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`,
                payroll.employee?.department?.name || '',
                String(payroll.basicSalary || 0),
                String(payroll.allowance || 0),
                String(payroll.grossSalary || 0),
                String(payroll.tax || 0),
                String(payroll.totalDeductions || 0),
                String(payroll.netSalary || 0)
            ]);
        });
        const detailSheet = XLSX.utils.aoa_to_sheet(detailData);
        XLSX.utils.book_append_sheet(workbook, detailSheet, 'Chi tiết lương');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportPersonnelTurnoverToExcel(startDate, endDate, departmentId) {
        const turnoverData = await this.getPersonnelTurnover(startDate, endDate, departmentId);
        const employees = await this.employeeRepository.find({
            relations: ['department', 'contracts'],
        });
        const filteredEmployees = departmentId
            ? employees.filter(emp => emp.departmentId === departmentId)
            : employees;
        const workbook = XLSX.utils.book_new();
        const summaryData = [
            ['BÁO CÁO BIẾN ĐỘNG NHÂN SỰ'],
            [`Từ ngày: ${startDate.toLocaleDateString('vi-VN')} - Đến ngày: ${endDate.toLocaleDateString('vi-VN')}`],
            [''],
            ['Tổng tuyển dụng', turnoverData.summary.totalHires],
            ['Tổng nghỉ việc', turnoverData.summary.totalDepartures],
            ['Biến động ròng', turnoverData.summary.netChange],
            ['Nhân viên hiện tại', turnoverData.summary.currentActiveEmployees],
            ['Tỷ lệ biến động (%)', turnoverData.summary.turnoverRate],
        ];
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Tổng quan');
        const deptData = [
            ['Phòng ban', 'Tuyển dụng', 'Nghỉ việc', 'Biến động ròng', 'Nhân viên hiện tại']
        ];
        turnoverData.byDepartment.forEach((dept) => {
            deptData.push([
                dept.departmentName,
                dept.hires,
                dept.departures,
                dept.netChange,
                dept.currentActive
            ]);
        });
        const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
        XLSX.utils.book_append_sheet(workbook, deptSheet, 'Theo phòng ban');
        const empData = [
            ['Mã NV', 'Họ tên', 'Phòng ban', 'Ngày vào làm', 'Ngày nghỉ việc', 'Trạng thái']
        ];
        filteredEmployees.forEach(emp => {
            empData.push([
                emp.employeeCode,
                `${emp.firstName} ${emp.lastName}`,
                emp.department?.name || '',
                emp.hireDate ? emp.hireDate.toLocaleDateString('vi-VN') : '',
                emp.terminationDate ? emp.terminationDate.toLocaleDateString('vi-VN') : '',
                emp.status
            ]);
        });
        const empSheet = XLSX.utils.aoa_to_sheet(empData);
        XLSX.utils.book_append_sheet(workbook, empSheet, 'Chi tiết nhân viên');
        const terminatedData = [
            ['Mã NV', 'Họ tên', 'Phòng ban', 'Ngày vào làm', 'Ngày nghỉ việc', 'Trạng thái']
        ];
        const terminatedEmployees = filteredEmployees.filter(emp => emp.status === 'terminated');
        terminatedEmployees.forEach(emp => {
            terminatedData.push([
                emp.employeeCode,
                `${emp.firstName} ${emp.lastName}`,
                emp.department?.name || '',
                emp.hireDate ? emp.hireDate.toLocaleDateString('vi-VN') : '',
                emp.terminationDate ? emp.terminationDate.toLocaleDateString('vi-VN') : '',
                'Nghỉ việc'
            ]);
        });
        const terminatedSheet = XLSX.utils.aoa_to_sheet(terminatedData);
        XLSX.utils.book_append_sheet(workbook, terminatedSheet, 'Nhân viên đã nghỉ việc');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
    async exportStaffingByDepartmentToExcel() {
        const staffingData = await this.getStaffingByDepartment();
        const employees = await this.employeeRepository.find({
            relations: ['department', 'position'],
        });
        const workbook = XLSX.utils.book_new();
        const deptData = [
            ['Phòng ban', 'Tổng nhân viên', 'Nhân viên hoạt động', 'Tỷ lệ sử dụng (%)']
        ];
        staffingData.forEach(dept => {
            const utilizationRate = dept.totalEmployees > 0
                ? Math.round((dept.activeEmployees / dept.totalEmployees) * 100)
                : 0;
            deptData.push([
                dept.departmentName,
                dept.totalEmployees,
                dept.activeEmployees,
                utilizationRate
            ]);
        });
        const deptSheet = XLSX.utils.aoa_to_sheet(deptData);
        XLSX.utils.book_append_sheet(workbook, deptSheet, 'Tổng quan phòng ban');
        const empData = [
            ['Mã NV', 'Họ tên', 'Phòng ban', 'Chức vụ', 'Trạng thái', 'Ngày vào làm']
        ];
        employees.forEach(emp => {
            empData.push([
                emp.employeeCode,
                `${emp.firstName} ${emp.lastName}`,
                emp.department?.name || '',
                emp.position?.title || '',
                emp.status,
                emp.hireDate ? emp.hireDate.toLocaleDateString('vi-VN') : ''
            ]);
        });
        const empSheet = XLSX.utils.aoa_to_sheet(empData);
        XLSX.utils.book_append_sheet(workbook, empSheet, 'Chi tiết nhân viên');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(3, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReportsService);
//# sourceMappingURL=reports.service.js.map