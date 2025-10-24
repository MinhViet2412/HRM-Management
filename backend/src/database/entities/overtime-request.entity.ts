import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

export enum OvertimeStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('overtime_requests')
export class OvertimeRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, (employee) => employee.id)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  // OT date (the working day)
  @Column({ type: 'date' })
  date: Date;

  // Start and end time within the day (HH:MM)
  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  // Total OT hours for convenience queries
  @Column({ type: 'decimal', precision: 5, scale: 2 })
  hours: number;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Column({
    type: 'enum',
    enum: OvertimeStatus,
    default: OvertimeStatus.PENDING,
  })
  status: OvertimeStatus;

  // Approvals
  @Column({ nullable: true })
  approverId: string | null;

  @Column({ nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


