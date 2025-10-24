import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  // store times as string HH:mm for simplicity
  @Column()
  startTime: string;

  @Column()
  endTime: string;

  // Lunch break start time
  @Column({ nullable: true })
  lunchBreakStart: string;

  // Lunch break end time
  @Column({ nullable: true })
  lunchBreakEnd: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


