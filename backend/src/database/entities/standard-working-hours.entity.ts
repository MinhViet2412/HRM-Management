import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('standard_working_hours')
@Index(['year', 'month'], { unique: true })
export class StandardWorkingHours {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  year: number; // Năm: 2025

  @Column({ type: 'int' })
  month: number; // Tháng: 1-12

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  standardHours: number; // Số giờ công chuẩn trong tháng

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  standardDays: number; // Số ngày công chuẩn trong tháng

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả (ví dụ: "Tháng 12 có nhiều ngày nghỉ lễ")

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

