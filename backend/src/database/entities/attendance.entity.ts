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

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HALF_DAY = 'half_day',
  EARLY_LEAVE = 'early_leave',
}

@Entity('attendances')
@Index(['employeeId', 'date'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  checkIn: Date;

  @Column({ nullable: true })
  checkOut: Date;

  @Column({ nullable: true })
  breakStart: Date;

  @Column({ nullable: true })
  breakEnd: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  workingHours: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overtimeHours: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.ABSENT,
  })
  status: AttendanceStatus;

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

  @ManyToOne(() => Employee, (employee) => employee.attendances)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;
}
