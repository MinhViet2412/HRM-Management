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
exports.PayslipsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payslip_entity_1 = require("../database/entities/payslip.entity");
const payroll_entity_1 = require("../database/entities/payroll.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const attendance_entity_1 = require("../database/entities/attendance.entity");
let PayslipsService = class PayslipsService {
    constructor(payslipRepo, payrollRepo, employeeRepo, attendanceRepo) {
        this.payslipRepo = payslipRepo;
        this.payrollRepo = payrollRepo;
        this.employeeRepo = employeeRepo;
        this.attendanceRepo = attendanceRepo;
    }
    async list(period) {
        const list = await this.payslipRepo.find({ where: { period }, relations: ['employee', 'employee.department', 'employee.position', 'payroll'] });
        const [year, month] = period.split('-').map((v) => parseInt(v, 10));
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        for (const p of list) {
            const atts = await this.attendanceRepo.find({ where: { employeeId: p.employeeId, date: (0, typeorm_2.Between)(start, end) } });
            const daysWorked = atts.filter(a => a.status !== attendance_entity_1.AttendanceStatus.ABSENT).length;
            const daysAbsent = atts.filter(a => a.status === attendance_entity_1.AttendanceStatus.ABSENT).length;
            p._summary = { daysWorked, daysAbsent };
        }
        return list;
    }
    async listByEmployee(employeeId, period) {
        return this.payslipRepo.find({
            where: { employeeId, period },
            relations: ['employee', 'employee.department', 'employee.position', 'payroll'],
        });
    }
    async get(id) {
        const ps = await this.payslipRepo.findOne({ where: { id }, relations: ['employee', 'payroll'] });
        if (!ps)
            throw new common_1.NotFoundException('Payslip not found');
        return ps;
    }
    async bulkCreate(period, employeeIds) {
        const periodRegex = /^\d{4}-\d{2}$/;
        if (!periodRegex.test(period)) {
            throw new common_1.BadRequestException('Invalid period format. Expected YYYY-MM');
        }
        const whereEmployees = employeeIds && employeeIds.length > 0 ? { id: (0, typeorm_2.In)(employeeIds) } : {};
        const employees = await this.employeeRepo.find({ where: whereEmployees });
        if (employees.length === 0)
            throw new common_1.BadRequestException('No employees found');
        const payrolls = await this.payrollRepo.find({ where: { period } });
        const payrollByEmp = new Map(payrolls.map(p => [p.employeeId, p]));
        const created = [];
        for (const emp of employees) {
            const exists = await this.payslipRepo.findOne({ where: { employeeId: emp.id, period } });
            if (exists) {
                if (exists.status === payslip_entity_1.PayslipStatus.CANCELLED) {
                    await this.payslipRepo.delete(exists.id);
                }
                else {
                    continue;
                }
            }
            const payroll = payrollByEmp.get(emp.id);
            if (!payroll) {
                continue;
            }
            const payslip = this.payslipRepo.create({
                employeeId: emp.id,
                period,
                payrollId: payroll.id,
                amount: Number(payroll.netSalary || 0),
                status: payslip_entity_1.PayslipStatus.ISSUED,
            });
            created.push(await this.payslipRepo.save(payslip));
        }
        if (created.length === 0) {
            throw new common_1.BadRequestException('No payslips created (may already exist or payroll missing).');
        }
        return created;
    }
    async remove(id) {
        const existing = await this.payslipRepo.findOne({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException('Payslip not found');
        await this.payslipRepo.delete(id);
        return { deleted: true };
    }
    async updateStatus(id, status) {
        const ps = await this.payslipRepo.findOne({ where: { id } });
        if (!ps)
            throw new common_1.NotFoundException('Payslip not found');
        ps.status = status;
        return this.payslipRepo.save(ps);
    }
};
exports.PayslipsService = PayslipsService;
exports.PayslipsService = PayslipsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payslip_entity_1.Payslip)),
    __param(1, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(3, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PayslipsService);
//# sourceMappingURL=payslips.service.js.map