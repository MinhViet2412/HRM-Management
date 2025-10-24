import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between } from 'typeorm';
import { Payslip, PayslipStatus } from '../database/entities/payslip.entity';
import { Payroll } from '../database/entities/payroll.entity';
import { Employee } from '../database/entities/employee.entity';
import { Attendance, AttendanceStatus } from '../database/entities/attendance.entity';

@Injectable()
export class PayslipsService {
  constructor(
    @InjectRepository(Payslip) private payslipRepo: Repository<Payslip>,
    @InjectRepository(Payroll) private payrollRepo: Repository<Payroll>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
    @InjectRepository(Attendance) private attendanceRepo: Repository<Attendance>,
  ) {}

  async list(period: string): Promise<Payslip[]> {
    const list = await this.payslipRepo.find({ where: { period }, relations: ['employee', 'employee.department', 'employee.position', 'payroll'] });
    // enrich with leave days and working days summary from attendance
    const [year, month] = period.split('-').map((v)=>parseInt(v,10))
    const start = new Date(year, month-1, 1)
    const end = new Date(year, month, 0)
    for (const p of list) {
      const atts = await this.attendanceRepo.find({ where: { employeeId: p.employeeId, date: Between(start, end) } })
      const daysWorked = atts.filter(a=>a.status !== AttendanceStatus.ABSENT).length
      const daysAbsent = atts.filter(a=>a.status === AttendanceStatus.ABSENT).length
      ;(p as any)._summary = { daysWorked, daysAbsent }
    }
    return list
  }

  async listByEmployee(employeeId: string, period: string): Promise<Payslip[]> {
    return this.payslipRepo.find({
      where: { employeeId, period },
      relations: ['employee', 'employee.department', 'employee.position', 'payroll'],
    });
  }

  async get(id: string): Promise<Payslip> {
    const ps = await this.payslipRepo.findOne({ where: { id }, relations: ['employee', 'payroll'] });
    if (!ps) throw new NotFoundException('Payslip not found');
    return ps;
  }

  async bulkCreate(period: string, employeeIds?: string[]): Promise<Payslip[]> {
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      throw new BadRequestException('Invalid period format. Expected YYYY-MM');
    }

    const whereEmployees = employeeIds && employeeIds.length > 0 ? { id: In(employeeIds) } : {};
    const employees = await this.employeeRepo.find({ where: whereEmployees as any });
    if (employees.length === 0) throw new BadRequestException('No employees found');

    // Load payrolls for period
    const payrolls = await this.payrollRepo.find({ where: { period } });
    const payrollByEmp = new Map(payrolls.map(p => [p.employeeId, p]));

    const created: Payslip[] = [];
    for (const emp of employees) {
      const exists = await this.payslipRepo.findOne({ where: { employeeId: emp.id, period } });
      if (exists) {
        if (exists.status === PayslipStatus.CANCELLED) {
          await this.payslipRepo.delete(exists.id); // allow recreate when cancelled
        } else {
          continue; // enforce one active payslip per month
        }
      }

      const payroll = payrollByEmp.get(emp.id);
      if (!payroll) {
        // skip if payroll not generated yet
        continue;
      }

      const payslip = this.payslipRepo.create({
        employeeId: emp.id,
        period,
        payrollId: payroll.id,
        amount: Number(payroll.netSalary || 0),
        status: PayslipStatus.ISSUED,
      });
      created.push(await this.payslipRepo.save(payslip));
    }

    if (created.length === 0) {
      throw new BadRequestException('No payslips created (may already exist or payroll missing).');
    }
    return created;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const existing = await this.payslipRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException('Payslip not found');
    await this.payslipRepo.delete(id);
    return { deleted: true };
  }

  async updateStatus(id: string, status: PayslipStatus): Promise<Payslip> {
    const ps = await this.payslipRepo.findOne({ where: { id } });
    if (!ps) throw new NotFoundException('Payslip not found');
    ps.status = status;
    return this.payslipRepo.save(ps);
  }
}


