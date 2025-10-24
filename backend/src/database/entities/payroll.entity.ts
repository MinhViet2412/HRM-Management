import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum PayrollStatus {
  DRAFT = 'draft',
  GENERATED = 'generated',
  APPROVED = 'approved',
  PAID = 'paid',
}

@Entity('payrolls')
@Index(['employeeId', 'period'], { unique: true })
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({ type: 'varchar', length: 7 }) // YYYY-MM format
  period: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  grossSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  socialInsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  healthInsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  unemploymentInsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  netSalary: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  workingDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  actualWorkingDays: number;

  @Column({
    type: 'enum',
    enum: PayrollStatus,
    default: PayrollStatus.DRAFT,
  })
  status: PayrollStatus;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.payrolls)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
