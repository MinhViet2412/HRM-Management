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
exports.PayrollService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payroll_entity_1 = require("../database/entities/payroll.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const attendance_entity_1 = require("../database/entities/attendance.entity");
const contract_entity_1 = require("../database/entities/contract.entity");
const overtime_request_entity_1 = require("../database/entities/overtime-request.entity");
let PayrollService = class PayrollService {
    constructor(payrollRepository, employeeRepository, attendanceRepository, overtimeRepository) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.overtimeRepository = overtimeRepository;
    }
    async generatePayroll(period, targetEmployeeId) {
        const [year, month] = period.split('-');
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0);
        const employees = await this.employeeRepository.find({
            where: targetEmployeeId ? { id: targetEmployeeId, status: employee_entity_1.EmployeeStatus.ACTIVE } : { status: employee_entity_1.EmployeeStatus.ACTIVE },
        });
        const payrolls = [];
        for (const employee of employees) {
            let existingPayroll = await this.payrollRepository.findOne({
                where: { employeeId: employee.id, period },
            });
            const contractRepo = this.employeeRepository.manager.getRepository(contract_entity_1.Contract);
            const contract = await contractRepo.findOne({
                where: [
                    {
                        employeeId: employee.id,
                        status: contract_entity_1.ContractStatus.ACTIVE,
                        startDate: (0, typeorm_2.LessThanOrEqual)(endDate),
                        endDate: (0, typeorm_2.IsNull)(),
                    },
                    {
                        employeeId: employee.id,
                        status: contract_entity_1.ContractStatus.ACTIVE,
                        startDate: (0, typeorm_2.LessThanOrEqual)(endDate),
                        endDate: (0, typeorm_2.MoreThanOrEqual)(startDate),
                    },
                ],
            });
            if (!contract) {
                if (existingPayroll) {
                    await this.payrollRepository.remove(existingPayroll);
                }
                continue;
            }
            const attendances = await this.attendanceRepository.find({
                where: {
                    employeeId: employee.id,
                    date: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            const workingDays = attendances.filter(a => a.status !== 'absent').length;
            const totalWorkingDays = this.getWorkingDaysInMonth(startDate);
            const standardWorkingHours = totalWorkingDays * 8;
            const actualWorkingHours = attendances.reduce((sum, a) => sum + Number(a.workingHours || 0), 0);
            const basicSalary = Number(contract.baseSalary || employee.basicSalary || 0);
            const allowance = Number(contract.allowance || employee.allowance || 0);
            const hourlyRate = standardWorkingHours > 0 ? basicSalary / standardWorkingHours : 0;
            const attendanceOvertimeHours = attendances.reduce((sum, a) => sum + Number(a.overtimeHours || 0), 0);
            const approvedOT = await this.overtimeRepository.find({
                where: {
                    employeeId: employee.id,
                    status: overtime_request_entity_1.OvertimeStatus.APPROVED,
                    date: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            const approvedOTHours = approvedOT.reduce((sum, r) => sum + Number(r.hours || 0), 0);
            const overtimeHours = attendanceOvertimeHours + approvedOTHours;
            const overtimePay = hourlyRate * overtimeHours * 1.5;
            const actualSalary = hourlyRate * actualWorkingHours;
            const bonus = 0;
            const grossSalary = actualSalary + allowance + overtimePay + bonus;
            const insuranceBase = basicSalary;
            const socialInsurance = insuranceBase * 0.08;
            const healthInsurance = insuranceBase * 0.015;
            const unemploymentInsurance = insuranceBase * 0.01;
            const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;
            const personalDeduction = 11000000;
            const taxableIncome = Math.max(0, grossSalary - totalInsurance - personalDeduction);
            const tax = this.calculatePersonalIncomeTax(taxableIncome);
            const totalDeductions = totalInsurance + tax;
            const netSalary = grossSalary - totalDeductions;
            const entity = existingPayroll ?? this.payrollRepository.create({ employeeId: employee.id, period });
            entity.basicSalary = basicSalary;
            entity.allowance = allowance;
            entity.overtimePay = overtimePay;
            entity.bonus = bonus;
            entity.grossSalary = grossSalary;
            entity.tax = tax;
            entity.socialInsurance = socialInsurance;
            entity.healthInsurance = healthInsurance;
            entity.unemploymentInsurance = unemploymentInsurance;
            entity.totalDeductions = totalDeductions;
            entity.netSalary = netSalary;
            entity.workingDays = totalWorkingDays;
            entity.actualWorkingDays = workingDays;
            entity.status = payroll_entity_1.PayrollStatus.GENERATED;
            entity.approvedAt = null;
            entity.approvedBy = null;
            payrolls.push(await this.payrollRepository.save(entity));
        }
        return payrolls;
    }
    async getPayrollByEmployee(employeeId, period) {
        const query = { employeeId };
        if (period) {
            query.period = period;
        }
        return this.payrollRepository.find({
            where: query,
            relations: ['employee'],
            order: { period: 'DESC' },
        });
    }
    async getPayrollByPeriod(period) {
        return this.payrollRepository.find({
            where: { period },
            relations: ['employee'],
        });
    }
    async approvePayroll(id, approvedBy) {
        const payroll = await this.payrollRepository.findOne({
            where: { id },
        });
        if (!payroll) {
            throw new common_1.NotFoundException('Payroll not found');
        }
        if (payroll.status !== payroll_entity_1.PayrollStatus.GENERATED) {
            throw new common_1.BadRequestException('Payroll is not in generated status');
        }
        payroll.status = payroll_entity_1.PayrollStatus.APPROVED;
        payroll.approvedBy = approvedBy;
        payroll.approvedAt = new Date();
        return this.payrollRepository.save(payroll);
    }
    getWorkingDaysInMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let workingDays = 0;
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays++;
            }
        }
        return workingDays;
    }
    calculateTax(grossSalary) {
        return this.calculatePersonalIncomeTax(grossSalary);
    }
    calculatePersonalIncomeTax(taxableIncome) {
        const brackets = [
            { threshold: 5000000, rate: 0.05 },
            { threshold: 10000000, rate: 0.10 },
            { threshold: 18000000, rate: 0.15 },
            { threshold: 32000000, rate: 0.20 },
            { threshold: 52000000, rate: 0.25 },
            { threshold: 80000000, rate: 0.30 },
            { threshold: Infinity, rate: 0.35 },
        ];
        let remaining = taxableIncome;
        let lastThreshold = 0;
        let tax = 0;
        for (const { threshold, rate } of brackets) {
            if (remaining <= 0)
                break;
            const band = Math.min(remaining, threshold - lastThreshold);
            tax += band * rate;
            remaining -= band;
            lastThreshold = threshold;
        }
        return Math.max(0, Math.floor(tax));
    }
    async generatePayrollPdf(id, requester) {
        const payroll = await this.payrollRepository.findOne({ where: { id }, relations: ['employee'] });
        if (!payroll)
            throw new common_1.NotFoundException('Payroll not found');
        const isEmployee = requester?.role === 'employee';
        if (isEmployee && requester?.employeeId !== payroll.employeeId) {
            throw new common_1.ForbiddenException('Not allowed');
        }
        const PDFDocument = (await Promise.resolve().then(() => require('pdfkit'))).default;
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const filename = `payroll-${payroll.period}-${payroll.employee?.employeeCode || payroll.employeeId}.pdf`;
        doc.fontSize(18).text('Payslip', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Employee: ${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`);
        doc.text(`Employee Code: ${payroll.employee?.employeeCode || '-'}`);
        doc.text(`Period: ${payroll.period}`);
        doc.moveDown();
        doc.fontSize(14).text('Earnings');
        doc.fontSize(12);
        doc.text(`Basic Salary: ${Number(payroll.basicSalary || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Allowance: ${Number(payroll.allowance || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Overtime Pay: ${Number(payroll.overtimePay || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Bonus: ${Number(payroll.bonus || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Gross Salary: ${Number(payroll.grossSalary || 0).toLocaleString('vi-VN')} ₫`);
        doc.moveDown();
        doc.fontSize(14).text('Deductions');
        doc.fontSize(12);
        doc.text(`Social Insurance: ${Number(payroll.socialInsurance || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Health Insurance: ${Number(payroll.healthInsurance || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Unemployment Insurance: ${Number(payroll.unemploymentInsurance || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Tax: ${Number(payroll.tax || 0).toLocaleString('vi-VN')} ₫`);
        doc.text(`Total Deductions: ${Number(payroll.totalDeductions || 0).toLocaleString('vi-VN')} ₫`);
        doc.moveDown();
        doc.fontSize(14).text('Net Salary');
        doc.fontSize(12).text(`${Number(payroll.netSalary || 0).toLocaleString('vi-VN')} ₫`, { align: 'right' });
        doc.end();
        return { stream: doc, filename };
    }
};
exports.PayrollService = PayrollService;
exports.PayrollService = PayrollService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payroll_entity_1.Payroll)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(3, (0, typeorm_1.InjectRepository)(overtime_request_entity_1.OvertimeRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map