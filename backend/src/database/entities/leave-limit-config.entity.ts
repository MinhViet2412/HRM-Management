import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { LeaveType } from './leave-request.entity';

@Entity('leave_limit_config')
@Index(['leaveType', 'year'], { unique: true })
export class LeaveLimitConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LeaveType,
  })
  leaveType: LeaveType; // Loại nghỉ phép: annual, sick, maternity, unpaid

  @Column({ type: 'int' })
  year: number; // Năm áp dụng (ví dụ: 2025)

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxDays: number; // Số ngày tối đa được phép nghỉ trong năm

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả (ví dụ: "Theo quy định công ty")

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Có đang áp dụng hay không

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

