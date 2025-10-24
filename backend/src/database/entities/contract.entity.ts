import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { ContractType } from './contract-type.entity';

export enum ContractStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TERMINATED = 'terminated',
  PENDING = 'pending',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  contractCode: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  employee: Employee;

  @Column()
  employeeId: string;

  @ManyToOne(() => ContractType, (type) => type.contracts, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  type?: ContractType | null;

  @Column({ nullable: true })
  typeId?: string | null;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date | null;

  @Column({ type: 'enum', enum: ContractStatus, default: ContractStatus.PENDING })
  status: ContractStatus;

  // Salary & compensation info in the contract
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  allowance: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  bonus: number;

  @Column({ type: 'json', nullable: true })
  benefits?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


