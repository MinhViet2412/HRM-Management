import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Employee } from './employee.entity';
import { User } from './user.entity';

export enum ResignationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PROCESSED = 'processed',
}

@Entity('resignation_requests')
export class ResignationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Column()
  employeeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requestedById' })
  requestedBy: User;

  @Column()
  requestedById: string;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: ResignationStatus,
    default: ResignationStatus.PENDING,
  })
  status: ResignationStatus;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approvedById' })
  approvedBy: User;

  @Column({ nullable: true })
  approvedById: string;

  @Column({ nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


