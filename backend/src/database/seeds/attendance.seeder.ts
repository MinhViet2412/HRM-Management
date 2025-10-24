import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance, AttendanceStatus } from '../entities/attendance.entity';
import { Employee } from '../entities/employee.entity';

@Injectable()
export class AttendanceSeeder {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async run(): Promise<void> {
    // Request: import attendance for EMP0006 from 2025-10-01 to 2025-10-07
    const employeeCode = 'EMP0006';
    const start = new Date('2025-10-01');
    const end = new Date('2025-10-07');

    const employee = await this.employeeRepo.findOne({ where: { employeeCode } });
    if (!employee) {
      console.warn(`Employee ${employeeCode} not found. Skipping attendance seeding.`);
      return;
    }

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = new Date(d);
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const exists = await this.attendanceRepo.findOne({ where: { employeeId: employee.id, date } });
      if (exists) continue;

      const checkIn = new Date(date);
      checkIn.setHours(9, 0, 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(18, 0, 0, 0);

      const attendance = this.attendanceRepo.create({
        employeeId: employee.id,
        date,
        checkIn,
        checkOut,
        workingHours: 8,
        overtimeHours: 0,
        status: AttendanceStatus.PRESENT,
        notes: 'Seeded record',
      });
      await this.attendanceRepo.save(attendance);
    }

    console.log(`Seeded attendance for ${employeeCode} from 2025-10-01 to 2025-10-07`);
  }
}


