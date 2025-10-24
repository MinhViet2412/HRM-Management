import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Employee } from './employee.entity';
import { Department } from './department.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxSalary: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Employee, (employee) => employee.position)
  employees: Employee[];

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  department: Department;

  @Column({ nullable: true })
  departmentId: string;
}
