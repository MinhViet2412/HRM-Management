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
const insurance_config_service_1 = require("../insurance-config/insurance-config.service");
const insurance_config_entity_1 = require("../database/entities/insurance-config.entity");
const tax_config_service_1 = require("../tax-config/tax-config.service");
const dependents_service_1 = require("../dependents/dependents.service");
const standard_working_hours_service_1 = require("../standard-working-hours/standard-working-hours.service");
let PayrollService = class PayrollService {
    constructor(payrollRepository, employeeRepository, attendanceRepository, overtimeRepository, insuranceConfigService, taxConfigService, dependentsService, standardWorkingHoursService) {
        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceRepository = attendanceRepository;
        this.overtimeRepository = overtimeRepository;
        this.insuranceConfigService = insuranceConfigService;
        this.taxConfigService = taxConfigService;
        this.dependentsService = dependentsService;
        this.standardWorkingHoursService = standardWorkingHoursService;
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
            const [year, month] = period.split('-').map(Number);
            const standardConfig = await this.standardWorkingHoursService.getOrCalculate(year, month);
            const totalWorkingDays = Number(standardConfig.days);
            const standardWorkingHours = Number(standardConfig.hours);
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
            let actualSalary;
            if (actualWorkingHours >= standardWorkingHours) {
                actualSalary = basicSalary;
            }
            else {
                actualSalary = hourlyRate * actualWorkingHours;
            }
            const bonus = 0;
            const grossSalary = actualSalary + allowance + overtimePay + bonus;
            const insuranceConfigs = await this.insuranceConfigService.findActive();
            let socialInsurance = 0;
            let healthInsurance = 0;
            let unemploymentInsurance = 0;
            for (const config of insuranceConfigs) {
                let insuranceBase;
                if (config.salaryType === 'contract_total_income') {
                    insuranceBase = basicSalary + allowance + bonus;
                }
                else {
                    insuranceBase = basicSalary;
                }
                const employeeRate = config.employeeRate ?? config.insuranceRate;
                const insuranceAmount = (insuranceBase * employeeRate) / 100;
                switch (config.type) {
                    case insurance_config_entity_1.InsuranceType.SOCIAL:
                        socialInsurance = insuranceAmount;
                        break;
                    case insurance_config_entity_1.InsuranceType.HEALTH:
                        healthInsurance = insuranceAmount;
                        break;
                    case insurance_config_entity_1.InsuranceType.UNEMPLOYMENT:
                        unemploymentInsurance = insuranceAmount;
                        break;
                }
            }
            const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;
            const personalDeductionAmount = await this.taxConfigService.getDependentDeductionAmount();
            const activeDependentsCount = await this.dependentsService.getActiveDependentsCount(employee.id);
            const personalDeduction = 11000000;
            const dependentsDeduction = activeDependentsCount * personalDeductionAmount;
            const totalDeduction = personalDeduction + dependentsDeduction;
            const taxableIncome = Math.max(0, grossSalary - totalInsurance - totalDeduction);
            const tax = this.calculatePersonalIncomeTax(taxableIncome);
            if (process.env.NODE_ENV === 'development') {
                console.log(`[Payroll Debug] Employee: ${employee.employeeCode}, Period: ${period}`);
                console.log(`  Basic Salary: ${basicSalary.toLocaleString('vi-VN')} VND`);
                console.log(`  Standard Working Hours: ${standardWorkingHours} hours`);
                console.log(`  Actual Working Hours: ${actualWorkingHours} hours`);
                console.log(`  Hourly Rate: ${hourlyRate.toLocaleString('vi-VN')} VND/hour`);
                console.log(`  Actual Salary: ${actualSalary.toLocaleString('vi-VN')} VND`);
                console.log(`  Gross Salary: ${grossSalary.toLocaleString('vi-VN')} VND`);
                console.log(`  Total Insurance: ${totalInsurance.toLocaleString('vi-VN')} VND`);
                console.log(`  Personal Deduction: ${personalDeduction.toLocaleString('vi-VN')} VND`);
                console.log(`  Dependents Count: ${activeDependentsCount}, Deduction: ${dependentsDeduction.toLocaleString('vi-VN')} VND`);
                console.log(`  Total Deduction: ${totalDeduction.toLocaleString('vi-VN')} VND`);
                console.log(`  Taxable Income: ${taxableIncome.toLocaleString('vi-VN')} VND`);
                console.log(`  Tax: ${tax.toLocaleString('vi-VN')} VND`);
            }
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
        if (taxableIncome <= 0) {
            return 0;
        }
        let tax = 0;
        let remaining = taxableIncome;
        if (remaining > 0) {
            const amount = Math.min(remaining, 5000000);
            tax += amount * 0.05;
            remaining -= amount;
        }
        if (remaining > 0) {
            const amount = Math.min(remaining, 5000000);
            tax += amount * 0.10;
            remaining -= amount;
        }
        if (remaining > 0) {
            const amount = Math.min(remaining, 8000000);
            tax += amount * 0.15;
            remaining -= amount;
        }
        if (remaining > 0) {
            const amount = Math.min(remaining, 14000000);
            tax += amount * 0.20;
            remaining -= amount;
        }
        if (remaining > 0) {
            const amount = Math.min(remaining, 20000000);
            tax += amount * 0.25;
            remaining -= amount;
        }
        if (remaining > 0) {
            const amount = Math.min(remaining, 28000000);
            tax += amount * 0.30;
            remaining -= amount;
        }
        if (remaining > 0) {
            tax += remaining * 0.35;
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
        typeorm_2.Repository,
        insurance_config_service_1.InsuranceConfigService,
        tax_config_service_1.TaxConfigService,
        dependents_service_1.DependentsService,
        standard_working_hours_service_1.StandardWorkingHoursService])
], PayrollService);
//# sourceMappingURL=payroll.service.js.map