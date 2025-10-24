import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { Employee } from '../entities/employee.entity';
export declare class AttendanceSeeder {
    private readonly attendanceRepo;
    private readonly employeeRepo;
    constructor(attendanceRepo: Repository<Attendance>, employeeRepo: Repository<Employee>);
    run(): Promise<void>;
}
