import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { Payroll, PayrollStatus } from '../database/entities/payroll.entity';
import { Employee, EmployeeStatus } from '../database/entities/employee.entity';
import { Attendance } from '../database/entities/attendance.entity';
import { Contract, ContractStatus } from '../database/entities/contract.entity';
import { OvertimeRequest, OvertimeStatus } from '../database/entities/overtime-request.entity';

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

      const workingDays = attendances.filter(a => (a.status as any) !== 'absent').length;
      const totalWorkingDays = this.getWorkingDaysInMonth(startDate);
      const standardWorkingHours = totalWorkingDays * 8; // 8 hours/day
      const actualWorkingHours = attendances.reduce((sum, a) => sum + Number(a.workingHours || 0), 0);

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

      // Pro-rated salary per formula
      const actualSalary = hourlyRate * actualWorkingHours;
      const bonus = 0;
      const grossSalary = actualSalary + allowance + overtimePay + bonus;

      // Insurance based on contractual salary (default VN practice, employee share)
      const insuranceBase = basicSalary;
      const socialInsurance = insuranceBase * 0.08; // 8%
      const healthInsurance = insuranceBase * 0.015; // 1.5%
      const unemploymentInsurance = insuranceBase * 0.01; // 1%
      const totalInsurance = socialInsurance + healthInsurance + unemploymentInsurance;

      // PIT: progressive after insurance and personal deduction
      const personalDeduction = 11000000; // default personal deduction (no dependents)
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
      if (remaining <= 0) break;
      const band = Math.min(remaining, threshold - lastThreshold);
      tax += band * rate;
      remaining -= band;
      lastThreshold = threshold;
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
