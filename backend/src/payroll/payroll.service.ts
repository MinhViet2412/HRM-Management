import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Payroll, PayrollStatus } from '../database/entities/payroll.entity';
import { Employee, EmployeeStatus } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Contract, ContractStatus } from '../database/entities/contract.entity';
import { OvertimeRequest, OvertimeStatus } from '../database/entities/overtime-request.entity';
import { InsuranceConfigService } from '../insurance-config/insurance-config.service';
import { InsuranceType } from '../database/entities/insurance-config.entity';
import { TaxConfigService } from '../tax-config/tax-config.service';
import { DependentsService } from '../dependents/dependents.service';
import { StandardWorkingHoursService } from '../standard-working-hours/standard-working-hours.service';
import { HolidaysService } from '../holidays/holidays.service';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(OvertimeRequest)
    private overtimeRepository: Repository<OvertimeRequest>,
    private insuranceConfigService: InsuranceConfigService,
    private taxConfigService: TaxConfigService,
    private dependentsService: DependentsService,
    private standardWorkingHoursService: StandardWorkingHoursService,
    private holidaysService: HolidaysService,
  ) {}

  async generatePayroll(period: string, targetEmployeeId?: string): Promise<Payroll[]> {
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const employees = await this.employeeRepository.find({
      where: targetEmployeeId ? { id: targetEmployeeId, status: EmployeeStatus.ACTIVE } as any : { status: EmployeeStatus.ACTIVE },
    });

    const payrolls: Payroll[] = [];

    for (const employee of employees) {
      // Check if payroll already exists (recompute latest): update instead of skipping
      let existingPayroll = await this.payrollRepository.findOne({
        where: { employeeId: employee.id, period },
      });

      // Ensure employee has an active contract in the period
      const contractRepo = this.employeeRepository.manager.getRepository(Contract);
      const contract = await contractRepo.findOne({
        where: [
          // endDate nullable: treat as open-ended
          {
            employeeId: employee.id,
            status: ContractStatus.ACTIVE,
            startDate: LessThanOrEqual(endDate),
            endDate: IsNull(),
          } as any,
          {
            employeeId: employee.id,
            status: ContractStatus.ACTIVE,
            startDate: LessThanOrEqual(endDate),
            endDate: MoreThanOrEqual(startDate),
          } as any,
        ],
      });

      if (!contract) {
        // If previously generated for this employee and period, remove it
        if (existingPayroll) {
          await this.payrollRepository.remove(existingPayroll);
        }
        // Skip employees without an active contract
        continue;
      }

      // Get attendance records for the period
      const attendances = await this.attendanceRepository.find({
        where: {
          employeeId: employee.id,
          date: Between(startDate, endDate),
        },
      });

      const attendanceWorkingDays = attendances.filter(a => (a.status as any) !== 'absent').length;
      
      // Get standard working hours from config (or calculate if not configured)
      const [year, month] = period.split('-').map(Number);
      const standardConfig = await this.standardWorkingHoursService.getOrCalculate(year, month);
      const standardWorkingDays = Number(standardConfig.days);
      const standardWorkingHours = Number(standardConfig.hours);
      
      // Paid holidays: grant full working hours even without attendance
      const holidays = await this.holidaysService.findByDateRange(startDate, endDate);
      const holidayCount = holidays.length;
      const dailyStandardHours =
        standardWorkingDays > 0 ? standardWorkingHours / standardWorkingDays : 8;
      const holidayWorkingHours = holidayCount * dailyStandardHours;
      
      const actualWorkingHours =
        attendances.reduce((sum, a) => sum + Number(a.workingHours || 0), 0) +
        holidayWorkingHours;

      const actualWorkingDays = attendanceWorkingDays + holidayCount;
      const workingDays = standardWorkingDays;

      // Contractual figures
      const basicSalary = Number(contract.baseSalary || employee.basicSalary || 0);
      const allowance = Number(contract.allowance || employee.allowance || 0);

      // Hourly rate from contract salary and standard hours
      const hourlyRate = standardWorkingHours > 0 ? basicSalary / standardWorkingHours : 0;

      // Overtime: attendance overtime + approved OT requests within period
      const attendanceOvertimeHours = attendances.reduce((sum, a) => sum + Number(a.overtimeHours || 0), 0);
      const approvedOT = await this.overtimeRepository.find({
        where: {
          employeeId: employee.id,
          status: OvertimeStatus.APPROVED,
          date: Between(startDate, endDate),
        },
      });
      const approvedOTHours = approvedOT.reduce((sum, r) => sum + Number(r.hours || 0), 0);
      const overtimeHours = attendanceOvertimeHours + approvedOTHours;
      const overtimePay = hourlyRate * overtimeHours * 1.5;

      // Calculate actual salary:
      // - If employee works full standard hours (>= standardWorkingHours), use full basicSalary
      // - Otherwise, calculate pro-rated based on actual working hours
      let actualSalary: number;
      if (actualWorkingHours >= standardWorkingHours) {
        // Employee worked full standard hours, use full contract salary
        actualSalary = basicSalary;
      } else {
        // Employee worked less than standard hours, calculate pro-rated
        actualSalary = hourlyRate * actualWorkingHours;
      }
      
      const bonus = 0;
      const grossSalary = actualSalary + allowance + overtimePay + bonus;

      // Calculate insurance based on configured insurance types
      const insuranceConfigs = await this.insuranceConfigService.findActive();
      
      // Calculate insurance base based on salaryType
      let socialInsurance = 0;
      let healthInsurance = 0;
      let unemploymentInsurance = 0;

      for (const config of insuranceConfigs) {
        // Determine insurance base based on salaryType
        let insuranceBase: number;
        if (config.salaryType === 'contract_total_income') {
          // Tổng thu nhập trong hợp đồng: Lương cơ bản + Thưởng + Phụ cấp
          insuranceBase = basicSalary + allowance + bonus;
        } else {
          // basic_salary: Chỉ tính trên lương cơ bản
          insuranceBase = basicSalary;
        }

        // Calculate insurance amount using employee rate (if specified) or general insurance rate
        const employeeRate = config.employeeRate ?? config.insuranceRate;
        const insuranceAmount = (insuranceBase * employeeRate) / 100;

        // Assign to appropriate insurance type
        switch (config.type) {
          case InsuranceType.SOCIAL:
            socialInsurance = insuranceAmount;
            break;
          case InsuranceType.HEALTH:
            healthInsurance = insuranceAmount;
            break;
          case InsuranceType.UNEMPLOYMENT:
            unemploymentInsurance = insuranceAmount;
            break;
        }
      }

      const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

      // PIT: progressive after insurance and personal deduction
      // Get personal deduction amount from config
      const personalDeductionAmount = await this.taxConfigService.getDependentDeductionAmount();
      
      // Get active dependents count for this employee
      const activeDependentsCount = await this.dependentsService.getActiveDependentsCount(employee.id);
      
      // Calculate total deduction: personal + dependents
      const personalDeduction = 11000000; // Personal deduction (11 triệu)
      const dependentsDeduction = activeDependentsCount * personalDeductionAmount;
      const totalDeduction = personalDeduction + dependentsDeduction;
      
      const taxableIncome = Math.max(0, grossSalary - totalInsurance - totalDeduction);
      const tax = this.calculatePersonalIncomeTax(taxableIncome);
      
      // Debug log (can be removed in production)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Payroll Debug] Employee: ${employee.employeeCode}, Period: ${period}`);
        console.log(`  Basic Salary: ${basicSalary.toLocaleString('vi-VN')} VND`);
        console.log(`  Standard Working Hours: ${standardWorkingHours} hours (${workingDays} days)`);
        console.log(`  Actual Working Hours: ${actualWorkingHours} hours (${actualWorkingDays} days)`);
        console.log(`  Paid Holidays: ${holidayCount} day(s), +${holidayWorkingHours} hours`);
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
      entity.workingDays = workingDays;
      entity.actualWorkingDays = actualWorkingDays;
      entity.status = PayrollStatus.GENERATED;
      entity.approvedAt = null as any;
      entity.approvedBy = null as any;

      payrolls.push(await this.payrollRepository.save(entity));
    }

    return payrolls;
  }

  async getPayrollByEmployee(employeeId: string, period?: string): Promise<Payroll[]> {
    const query: any = { employeeId };
    if (period) {
      query.period = period;
    }

    return this.payrollRepository.find({
      where: query,
      relations: ['employee'],
      order: { period: 'DESC' },
    });
  }

  async getPayrollByPeriod(period: string): Promise<Payroll[]> {
    return this.payrollRepository.find({
      where: { period },
      relations: ['employee'],
    });
  }

  async approvePayroll(id: string, approvedBy: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
    });

    if (!payroll) {
      throw new NotFoundException('Payroll not found');
    }

    if (payroll.status !== PayrollStatus.GENERATED) {
      throw new BadRequestException('Payroll is not in generated status');
    }

    payroll.status = PayrollStatus.APPROVED;
    payroll.approvedBy = approvedBy;
    payroll.approvedAt = new Date();

    return this.payrollRepository.save(payroll);
  }

  private getWorkingDaysInMonth(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let workingDays = 0;
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        workingDays++;
      }
    }
    
    return workingDays;
  }

  private calculateTax(grossSalary: number): number {
    // Deprecated: kept for backward compatibility if used elsewhere
    return this.calculatePersonalIncomeTax(grossSalary);
  }

  private calculatePersonalIncomeTax(taxableIncome: number): number {
    // Progressive tax brackets (VN monthly, in VND)
    // Thuế lũy tiến từng phần theo quy định VN
    // Bậc 1: Đến 5 triệu → 5%
    // Bậc 2: Trên 5 đến 10 triệu → 10%
    // Bậc 3: Trên 10 đến 18 triệu → 15%
    // Bậc 4: Trên 18 đến 32 triệu → 20%
    // Bậc 5: Trên 32 đến 52 triệu → 25%
    // Bậc 6: Trên 52 đến 80 triệu → 30%
    // Bậc 7: Trên 80 triệu → 35%

    if (taxableIncome <= 0) {
      return 0;
    }

    let tax = 0;
    let remaining = taxableIncome;

    // Bậc 1: 0 - 5 triệu (5%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 5000000);
      tax += amount * 0.05;
      remaining -= amount;
    }

    // Bậc 2: 5 - 10 triệu (10%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 5000000); // 10 triệu - 5 triệu = 5 triệu
      tax += amount * 0.10;
      remaining -= amount;
    }

    // Bậc 3: 10 - 18 triệu (15%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 8000000); // 18 triệu - 10 triệu = 8 triệu
      tax += amount * 0.15;
      remaining -= amount;
    }

    // Bậc 4: 18 - 32 triệu (20%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 14000000); // 32 triệu - 18 triệu = 14 triệu
      tax += amount * 0.20;
      remaining -= amount;
    }

    // Bậc 5: 32 - 52 triệu (25%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 20000000); // 52 triệu - 32 triệu = 20 triệu
      tax += amount * 0.25;
      remaining -= amount;
    }

    // Bậc 6: 52 - 80 triệu (30%)
    if (remaining > 0) {
      const amount = Math.min(remaining, 28000000); // 80 triệu - 52 triệu = 28 triệu
      tax += amount * 0.30;
      remaining -= amount;
    }

    // Bậc 7: Trên 80 triệu (35%)
    if (remaining > 0) {
      tax += remaining * 0.35;
    }

    return Math.max(0, Math.floor(tax));
  }

  async generatePayrollPdf(id: string, requester: any): Promise<{ stream: NodeJS.ReadableStream; filename: string }> {
    const payroll = await this.payrollRepository.findOne({ where: { id }, relations: ['employee'] });
    if (!payroll) throw new NotFoundException('Payroll not found');
    // Access check: employee can only download own payroll
    const isEmployee = requester?.role === 'employee';
    if (isEmployee && requester?.employeeId !== payroll.employeeId) {
      throw new ForbiddenException('Not allowed');
    }

    const PDFDocument = (await import('pdfkit')).default;
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const filename = `payroll-${payroll.period}-${payroll.employee?.employeeCode || payroll.employeeId}.pdf`;

    // Header
    doc.fontSize(18).text('Payslip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Employee: ${payroll.employee?.firstName || ''} ${payroll.employee?.lastName || ''}`);
    doc.text(`Employee Code: ${payroll.employee?.employeeCode || '-'}`);
    doc.text(`Period: ${payroll.period}`);
    doc.moveDown();

    // Earnings
    doc.fontSize(14).text('Earnings');
    doc.fontSize(12);
    doc.text(`Basic Salary: ${Number(payroll.basicSalary || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Allowance: ${Number(payroll.allowance || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Overtime Pay: ${Number(payroll.overtimePay || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Bonus: ${Number(payroll.bonus || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Gross Salary: ${Number(payroll.grossSalary || 0).toLocaleString('vi-VN')} ₫`);
    doc.moveDown();

    // Deductions
    doc.fontSize(14).text('Deductions');
    doc.fontSize(12);
    doc.text(`Social Insurance: ${Number(payroll.socialInsurance || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Health Insurance: ${Number(payroll.healthInsurance || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Unemployment Insurance: ${Number(payroll.unemploymentInsurance || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Tax: ${Number(payroll.tax || 0).toLocaleString('vi-VN')} ₫`);
    doc.text(`Total Deductions: ${Number(payroll.totalDeductions || 0).toLocaleString('vi-VN')} ₫`);
    doc.moveDown();

    // Net
    doc.fontSize(14).text('Net Salary');
    doc.fontSize(12).text(`${Number(payroll.netSalary || 0).toLocaleString('vi-VN')} ₫`, { align: 'right' });

    doc.end();
    return { stream: doc, filename };
  }
}
