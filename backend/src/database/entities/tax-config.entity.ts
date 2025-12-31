import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tax_config')
export class TaxConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string; // 'dependent_deduction_amount'

  @Column({ type: 'text' })
  value: string; // JSON string hoặc giá trị đơn giản

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả cấu hình

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

