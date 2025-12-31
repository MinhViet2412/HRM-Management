import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { Attendance } from './attendance.entity';
import { LeaveRequest } from './leave-request.entity';
import { Payroll } from './payroll.entity';
import { WorkLocation } from './work-location.entity';
import { Shift } from './shift.entity';
import { Dependent } from './dependent.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeCode: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  

  @Column({ nullable: true })
  address: string;

  // Permanent address (địa chỉ thường trú)
  @Column({ nullable: true })
  permanentAddress: string;

  // Current address (nơi ở hiện tại)
  @Column({ nullable: true })
  currentAddress: string;

  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  nationalId: string;

  // Citizen ID (CCCD)
  @Column({ nullable: true })
  citizenId: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  bankAccount: string;

  @Column({ nullable: true })
  bankName: string;

  // Ethnicity (dân tộc)
  @Column({ nullable: true })
  ethnicity: string;

  // Religion (tôn giáo)
  @Column({ nullable: true })
  religion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  basicSalary: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  allowance: number;

  @Column({ nullable: true })
  hireDate: Date;

  @Column({ nullable: true })
  terminationDate: Date;

  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
  })
  status: EmployeeStatus;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  // Leave balances
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 12 })
  annualLeaveBalance: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 6 })
  sickLeaveBalance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.employee, { nullable: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Department, (department) => department.employees)
  department: Department;

  @Column()
  departmentId: string;

  @ManyToOne(() => Position, (position) => position.employees)
  position: Position;

  @Column()
  positionId: string;

  @OneToMany(() => Attendance, (attendance) => attendance.employee)
  attendances: Attendance[];

  @ManyToOne(() => WorkLocation, (workLocation) => workLocation.employees, { nullable: true })
  workLocation: WorkLocation;

  @Column({ nullable: true })
  workLocationId: string;

  @ManyToOne(() => Shift, { nullable: true })
  shift: Shift;

  @Column({ nullable: true })
  shiftId: string;

  @OneToMany(() => LeaveRequest, (leaveRequest) => leaveRequest.employee)
  leaveRequests: LeaveRequest[];

  @OneToMany(() => Payroll, (payroll) => payroll.employee)
  payrolls: Payroll[];

  @OneToMany(() => Dependent, (dependent) => dependent.employee)
  dependents: Dependent[];
}
