import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum InsuranceType {
  SOCIAL = 'social', // Bảo hiểm xã hội (BHXH)
  HEALTH = 'health', // Bảo hiểm y tế (BHYT)
  UNEMPLOYMENT = 'unemployment', // Bảo hiểm thất nghiệp (BHTN)
}

@Entity('insurance_config')
export class InsuranceConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: InsuranceType,
    unique: true,
  })
  type: InsuranceType;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  insuranceRate: number; // Tỷ lệ % đóng bảo hiểm (ví dụ: 8.0)

  @Column({ type: 'varchar', length: 100, default: 'contract_total_income' })
  salaryType: string; // Loại lương tính bảo hiểm: "contract_total_income" (Tổng thu nhập trong hợp đồng) hoặc "basic_salary" (Lương cơ bản)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employeeRate: number; // Tỷ lệ % người lao động đóng (nếu null thì dùng insuranceRate)

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  employerRate: number; // Tỷ lệ % người sử dụng lao động đóng (nếu null thì dùng insuranceRate)

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Có đang áp dụng hay không

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

