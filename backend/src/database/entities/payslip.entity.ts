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
import { Payroll } from './payroll.entity';

export enum PayslipStatus {
  ISSUED = 'issued',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('payslips')
@Index(['employeeId', 'period'], { unique: true })
export class Payslip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({ type: 'varchar', length: 7 }) // YYYY-MM
  period: string;

  @Column({ nullable: true })
  payrollId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // net salary amount

  @Column({
    type: 'enum',
    enum: PayslipStatus,
    default: PayslipStatus.ISSUED,
  })
  status: PayslipStatus;

  @Column({ nullable: true })
  issuedBy: string;

  @Column({ nullable: true })
  paidAt: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ManyToOne(() => Payroll)
  @JoinColumn({ name: 'payrollId' })
  payroll: Payroll;
}


