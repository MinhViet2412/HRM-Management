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

export enum DependentRelationship {
  SPOUSE = 'spouse', // Vợ/Chồng
  CHILD = 'child', // Con
  PARENT = 'parent', // Cha/Mẹ
  SIBLING = 'sibling', // Anh/Chị/Em
  OTHER = 'other', // Khác
}

@Entity('dependents')
export class Dependent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: DependentRelationship,
  })
  relationship: DependentRelationship;

  @Column({ nullable: true })
  citizenId: string; // CCCD/CMND

  @Column({ nullable: true })
  taxCode: string; // Mã số thuế (nếu có)

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Còn phụ thuộc hay không

  @Column({ 
    type: 'decimal', 
    precision: 12, 
    scale: 2, 
    default: 4400000,
    nullable: true 
  })
  deductionAmount: number; // Giá trị giảm trừ (mặc định 4.400.000 VNĐ)

  @Column({ nullable: true, type: 'text' })
  notes: string; // Ghi chú

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Employee, (employee) => employee.dependents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;
}

