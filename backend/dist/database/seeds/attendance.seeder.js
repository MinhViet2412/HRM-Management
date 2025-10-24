"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../entities/attendance.entity");
const employee_entity_1 = require("../entities/employee.entity");
let AttendanceSeeder = class AttendanceSeeder {
    constructor(attendanceRepo, employeeRepo) {
        this.attendanceRepo = attendanceRepo;
        this.employeeRepo = employeeRepo;
    }
    async run() {
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
            if (date.getDay() === 0 || date.getDay() === 6)
                continue;
            const exists = await this.attendanceRepo.findOne({ where: { employeeId: employee.id, date } });
            if (exists)
                continue;
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
                status: attendance_entity_1.AttendanceStatus.PRESENT,
                notes: 'Seeded record',
            });
            await this.attendanceRepo.save(attendance);
        }
        console.log(`Seeded attendance for ${employeeCode} from 2025-10-01 to 2025-10-07`);
    }
};
exports.AttendanceSeeder = AttendanceSeeder;
exports.AttendanceSeeder = AttendanceSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], AttendanceSeeder);
//# sourceMappingURL=attendance.seeder.js.map