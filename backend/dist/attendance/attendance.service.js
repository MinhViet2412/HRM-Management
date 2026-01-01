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
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attendance_entity_1 = require("../database/entities/attendance.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const work_location_entity_1 = require("../database/entities/work-location.entity");
const working_hours_calculator_service_1 = require("./working-hours-calculator.service");
const attendance_rule_engine_service_1 = require("./attendance-rule-engine.service");
let AttendanceService = class AttendanceService {
    constructor(attendanceRepository, employeeRepository, workLocationRepository, workingHoursCalculator, attendanceRuleEngine) {
        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.workLocationRepository = workLocationRepository;
        this.workingHoursCalculator = workingHoursCalculator;
        this.attendanceRuleEngine = attendanceRuleEngine;
    }
    async checkIn(employeeId, checkInDto) {
        const employee = await this.employeeRepository.findOne({
            where: { id: employeeId },
            relations: ['workLocation', 'shift'],
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingAttendance = await this.attendanceRepository.findOne({
            where: {
                employeeId,
                date: today,
            },
        });
        if (existingAttendance && existingAttendance.checkIn) {
            throw new common_1.ConflictException('Already checked in today');
        }
        const checkInTime = checkInDto.checkInTime || new Date();
        const evaluation = this.attendanceRuleEngine.evaluateAttendance(checkInTime, null);
        let status = attendance_entity_1.AttendanceStatus.PRESENT;
        switch (evaluation.status) {
            case 'late':
                status = attendance_entity_1.AttendanceStatus.LATE;
                break;
            case 'absent':
                status = attendance_entity_1.AttendanceStatus.ABSENT;
                break;
            case 'missing_checkout':
                status = attendance_entity_1.AttendanceStatus.PRESENT;
                break;
            default:
                status = attendance_entity_1.AttendanceStatus.PRESENT;
        }
        if (employee.workLocation) {
            if (!checkInDto.latitude || !checkInDto.longitude) {
                throw new common_1.BadRequestException('Missing latitude/longitude for geo check-in. Please enable location access and try again.');
            }
            const { latitude: wlLat, longitude: wlLng, radius } = employee.workLocation;
            const lat = Number(checkInDto.latitude);
            const lng = Number(checkInDto.longitude);
            if (isNaN(lat) || isNaN(lng)) {
                throw new common_1.BadRequestException('Invalid latitude/longitude format');
            }
            const distance = this.calculateDistanceMeters(Number(wlLat), Number(wlLng), lat, lng);
            if (distance > radius) {
                throw new common_1.BadRequestException(`You are not within the allowed work location radius. Current distance: ${Math.round(distance)}m, allowed radius: ${radius}m`);
            }
        }
        if (existingAttendance) {
            existingAttendance.checkIn = checkInTime;
            existingAttendance.status = status;
            existingAttendance.notes = checkInDto.notes || existingAttendance.notes;
            return this.attendanceRepository.save(existingAttendance);
        }
        else {
            const attendance = this.attendanceRepository.create({
                employeeId,
                date: today,
                checkIn: checkInTime,
                status,
                notes: checkInDto.notes,
            });
            return this.attendanceRepository.save(attendance);
        }
    }
    async testAttendanceRules(checkIn, checkOut) {
        const evaluation = this.attendanceRuleEngine.evaluateAttendance(checkIn, checkOut);
        return {
            input: {
                checkIn: checkIn ? checkIn.toISOString() : null,
                checkOut: checkOut ? checkOut.toISOString() : null,
            },
            evaluation,
            allRules: this.attendanceRuleEngine.getAllRules()
        };
    }
    async getAllAttendanceRules() {
        return {
            rules: this.attendanceRuleEngine.getAllRules(),
            totalRules: this.attendanceRuleEngine.getAllRules().length
        };
    }
    async reEvaluateAttendanceRecords(startDate, endDate, departmentId) {
        let query = this.attendanceRepository.createQueryBuilder('attendance')
            .leftJoinAndSelect('attendance.employee', 'employee')
            .leftJoinAndSelect('employee.department', 'department');
        if (startDate && endDate) {
            query = query.where('attendance.date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        if (departmentId) {
            query = query.andWhere('employee.departmentId = :departmentId', { departmentId });
        }
        const attendances = await query.getMany();
        let updatedCount = 0;
        for (const attendance of attendances) {
            if (attendance.checkIn && attendance.checkOut) {
                const evaluation = this.attendanceRuleEngine.evaluateAttendance(attendance.checkIn, attendance.checkOut);
                let newStatus = attendance.status;
                switch (evaluation.status) {
                    case 'late':
                        newStatus = attendance_entity_1.AttendanceStatus.LATE;
                        break;
                    case 'early_leave':
                        newStatus = attendance_entity_1.AttendanceStatus.EARLY_LEAVE;
                        break;
                    case 'present':
                        newStatus = attendance_entity_1.AttendanceStatus.PRESENT;
                        break;
                    case 'absent':
                        newStatus = attendance_entity_1.AttendanceStatus.ABSENT;
                        break;
                }
                if (newStatus !== attendance.status) {
                    attendance.status = newStatus;
                    const evaluationNote = `[RE-EVALUATED]: ${evaluation.result} (${evaluation.matchedRule?.rule_id})`;
                    attendance.notes = attendance.notes
                        ? `${attendance.notes}\n${evaluationNote}`
                        : evaluationNote;
                    await this.attendanceRepository.save(attendance);
                    updatedCount++;
                }
            }
        }
        return {
            totalRecords: attendances.length,
            updatedRecords: updatedCount,
            message: `Re-evaluated ${attendances.length} records, updated ${updatedCount} records`
        };
    }
    calculateDistanceMeters(lat1, lon1, lat2, lon2) {
        const R = 6371000;
        const toRad = (d) => (d * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    async checkOut(employeeId, checkOutDto) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const employee = await this.employeeRepository.findOne({
            where: { id: employeeId },
            relations: ['workLocation'],
        });
        const attendance = await this.attendanceRepository.findOne({
            where: {
                employeeId,
                date: today,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('No attendance record found for today');
        }
        if (!attendance.checkIn) {
            throw new common_1.BadRequestException('Must check in before checking out');
        }
        if (attendance.checkOut) {
            throw new common_1.ConflictException('Already checked out today');
        }
        const checkOutTime = checkOutDto.checkOutTime || new Date();
        if (employee.workLocation) {
            if (!checkOutDto.latitude || !checkOutDto.longitude) {
                throw new common_1.BadRequestException('Missing latitude/longitude for geo check-out. Please enable location access and try again.');
            }
            const { latitude: wlLat, longitude: wlLng, radius } = employee.workLocation;
            const lat = Number(checkOutDto.latitude);
            const lng = Number(checkOutDto.longitude);
            if (isNaN(lat) || isNaN(lng)) {
                throw new common_1.BadRequestException('Invalid latitude/longitude format');
            }
            const distance = this.calculateDistanceMeters(Number(wlLat), Number(wlLng), lat, lng);
            if (distance > radius) {
                throw new common_1.BadRequestException(`You are not within the allowed work location radius. Current distance: ${Math.round(distance)}m, allowed radius: ${radius}m`);
            }
        }
        attendance.checkOut = checkOutTime;
        const evaluation = this.attendanceRuleEngine.evaluateAttendance(attendance.checkIn, checkOutTime);
        switch (evaluation.status) {
            case 'late':
                attendance.status = attendance_entity_1.AttendanceStatus.LATE;
                break;
            case 'early_leave':
                attendance.status = attendance_entity_1.AttendanceStatus.EARLY_LEAVE;
                break;
            case 'missing_checkout':
                attendance.status = attendance_entity_1.AttendanceStatus.PRESENT;
                break;
            default:
                attendance.status = attendance_entity_1.AttendanceStatus.PRESENT;
        }
        const workingMs = checkOutTime.getTime() - attendance.checkIn.getTime();
        const workingHours = workingMs / (1000 * 60 * 60);
        attendance.workingHours = Math.round(workingHours * 100) / 100;
        attendance.overtimeHours = Math.max(0, workingHours - 8);
        const ruleNote = `Rule: ${evaluation.result} (${evaluation.matchedRule?.rule_id})`;
        attendance.notes = attendance.notes
            ? `${attendance.notes}\n${ruleNote}`
            : ruleNote;
        attendance.notes = checkOutDto.notes || attendance.notes;
        return this.attendanceRepository.save(attendance);
    }
    async getAttendanceByEmployee(employeeId, startDate, endDate) {
        const employee = await this.employeeRepository.findOne({
            where: { id: employeeId },
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        const query = { employeeId };
        if (startDate && endDate) {
            query.date = (0, typeorm_2.Between)(startDate, endDate);
        }
        return this.attendanceRepository.find({
            where: query,
            order: { date: 'DESC' },
        });
    }
    async getAttendanceByDate(date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        return this.attendanceRepository.find({
            where: {
                date: (0, typeorm_2.Between)(startOfDay, endOfDay),
            },
            relations: ['employee'],
            order: { checkIn: 'ASC' },
        });
    }
    async getAttendanceWithFilters(startDate, endDate, departmentId) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        const query = {
            date: (0, typeorm_2.Between)(startOfDay, endOfDay),
        };
        if (departmentId) {
            query.employee = {
                departmentId: departmentId,
            };
        }
        return this.attendanceRepository.find({
            where: query,
            relations: ['employee', 'employee.department'],
            order: { date: 'DESC', checkIn: 'ASC' },
        });
    }
    async closeMissingCheckout(employeeId, date, approvedBy) {
        const attendance = await this.attendanceRepository.findOne({
            where: {
                employeeId,
                date,
            },
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        if (!attendance.checkIn) {
            throw new common_1.BadRequestException('Employee did not check in');
        }
        if (attendance.checkOut) {
            throw new common_1.BadRequestException('Employee already checked out');
        }
        const endOfDay = new Date(date);
        endOfDay.setHours(18, 0, 0, 0);
        attendance.checkOut = endOfDay;
        attendance.approvedBy = approvedBy;
        attendance.approvedAt = new Date();
        const workingMs = endOfDay.getTime() - attendance.checkIn.getTime();
        const workingHours = workingMs / (1000 * 60 * 60);
        attendance.workingHours = Math.round(workingHours * 100) / 100;
        return this.attendanceRepository.save(attendance);
    }
    async getAttendanceSummary(employeeId, startDate, endDate) {
        const attendances = await this.getAttendanceByEmployee(employeeId, startDate, endDate);
        const summary = {
            totalDays: attendances.length,
            presentDays: attendances.filter(a => a.status === attendance_entity_1.AttendanceStatus.PRESENT).length,
            lateDays: attendances.filter(a => a.status === attendance_entity_1.AttendanceStatus.LATE).length,
            absentDays: attendances.filter(a => a.status === attendance_entity_1.AttendanceStatus.ABSENT).length,
            halfDays: attendances.filter(a => a.status === attendance_entity_1.AttendanceStatus.HALF_DAY).length,
            totalWorkingHours: attendances.reduce((sum, a) => sum + (a.workingHours || 0), 0),
            totalOvertimeHours: attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
        };
        return summary;
    }
    async manualUpsert(dto, userId) {
        let employeeId = dto.employeeId;
        if (!employeeId && dto.employeeCode) {
            const emp = await this.employeeRepository.findOne({ where: { employeeCode: dto.employeeCode } });
            if (!emp)
                throw new common_1.NotFoundException('Employee not found');
            employeeId = emp.id;
        }
        if (!employeeId)
            throw new common_1.BadRequestException('employeeId or employeeCode is required');
        const date = new Date(dto.date);
        date.setHours(0, 0, 0, 0);
        let record = await this.attendanceRepository.findOne({ where: { employeeId, date } });
        const newIn = dto.checkIn ? new Date(dto.checkIn) : undefined;
        const newOut = dto.checkOut ? new Date(dto.checkOut) : undefined;
        if (record && (record.checkIn || record.checkOut)) {
            if (!newIn && !newOut) {
                throw new common_1.ConflictException('Đã có chấm công trong ngày này. Vui lòng dùng chức năng điều chỉnh.');
            }
            const existIn = record.checkIn ? new Date(record.checkIn) : undefined;
            const existOut = record.checkOut ? new Date(record.checkOut) : undefined;
            const overlaps = () => {
                if (existIn && existOut && newIn && newOut) {
                    return Math.max(existIn.getTime(), newIn.getTime()) < Math.min(existOut.getTime(), newOut.getTime());
                }
                if (existIn && newIn && existIn.getTime() === newIn.getTime())
                    return true;
                if (existOut && newOut && existOut.getTime() === newOut.getTime())
                    return true;
                if (newIn && newOut && existIn && newIn.getTime() <= existIn.getTime() && existIn.getTime() <= newOut.getTime())
                    return true;
                if (newIn && newOut && existOut && newIn.getTime() <= existOut.getTime() && existOut.getTime() <= newOut.getTime())
                    return true;
                if (existIn && existOut && newIn && existIn.getTime() <= newIn.getTime() && newIn.getTime() <= existOut.getTime())
                    return true;
                if (existIn && existOut && newOut && existIn.getTime() <= newOut.getTime() && newOut.getTime() <= existOut.getTime())
                    return true;
                return false;
            };
            if (overlaps()) {
                throw new common_1.ConflictException('Giờ công bạn nhập trùng với giờ công nhân viên đã có, vui lòng nhập giờ công khác');
            }
            throw new common_1.ConflictException('Đã tồn tại bản ghi chấm công trong ngày. Vui lòng điều chỉnh thay vì tạo mới.');
        }
        if (!record) {
            record = this.attendanceRepository.create({ employeeId, date });
        }
        if (newIn)
            record.checkIn = newIn;
        if (newOut)
            record.checkOut = newOut;
        record.notes = dto.notes ?? record.notes;
        if (record.checkIn && record.checkOut) {
            const ms = record.checkOut.getTime() - record.checkIn.getTime();
            const hours = ms / (1000 * 60 * 60);
            record.workingHours = Math.round(Math.min(hours, 24) * 100) / 100;
            record.overtimeHours = Math.max(0, record.workingHours - 8);
            record.status = attendance_entity_1.AttendanceStatus.PRESENT;
        }
        return this.attendanceRepository.save(record);
    }
    async adjustAttendance(attendanceId, adjustDto, adjustedBy) {
        const attendance = await this.attendanceRepository.findOne({
            where: { id: attendanceId },
            relations: ['employee', 'employee.shift'],
        });
        if (!attendance) {
            throw new common_1.NotFoundException('Attendance record not found');
        }
        if (adjustDto.checkIn) {
            attendance.checkIn = new Date(adjustDto.checkIn);
        }
        if (adjustDto.checkOut) {
            attendance.checkOut = new Date(adjustDto.checkOut);
        }
        if (adjustDto.status) {
            attendance.status = adjustDto.status;
        }
        if (adjustDto.notes !== undefined) {
            attendance.notes = adjustDto.notes;
        }
        if (adjustDto.checkIn || adjustDto.checkOut) {
            if (attendance.checkIn && attendance.checkOut && attendance.employee?.shift) {
                const calculation = this.workingHoursCalculator.calculateWorkingHours(attendance.checkIn, attendance.checkOut, attendance.employee.shift);
                attendance.workingHours = calculation.regularHours;
                attendance.overtimeHours = calculation.overtimeHours;
                if (calculation.status === 'late' || calculation.status === 'late_and_early') {
                    attendance.status = attendance_entity_1.AttendanceStatus.LATE;
                }
                const calculationNote = `Late: ${calculation.lateMinutes}m, Early leave: ${calculation.earlyLeaveMinutes}m`;
                attendance.notes = attendance.notes
                    ? `${attendance.notes}\n${calculationNote}`
                    : calculationNote;
            }
            else if (attendance.checkIn && attendance.checkOut) {
                const checkInTime = new Date(attendance.checkIn);
                const checkOutTime = new Date(attendance.checkOut);
                const diffMs = checkOutTime.getTime() - checkInTime.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);
                attendance.workingHours = Math.min(diffHours, 8);
                attendance.overtimeHours = Math.max(0, diffHours - 8);
            }
        }
        if (adjustDto.reason) {
            const adjustmentNote = `[ADJUSTED by ${adjustedBy}]: ${adjustDto.reason}`;
            attendance.notes = attendance.notes
                ? `${attendance.notes}\n${adjustmentNote}`
                : adjustmentNote;
        }
        return this.attendanceRepository.save(attendance);
    }
    async testWorkingHoursCalculation(checkInTime, checkOutTime, shiftId) {
        const shift = await this.attendanceRepository.query('SELECT * FROM shifts WHERE id = $1', [shiftId]);
        if (!shift || shift.length === 0) {
            throw new common_1.NotFoundException('Shift not found');
        }
        const shiftData = shift[0];
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);
        const calculation = this.workingHoursCalculator.calculateWorkingHours(checkIn, checkOut, shiftData);
        return {
            shift: {
                name: shiftData.name,
                startTime: shiftData.startTime,
                endTime: shiftData.endTime,
                lunchBreakStart: shiftData.lunchBreakStart,
                lunchBreakEnd: shiftData.lunchBreakEnd,
            },
            checkIn: checkIn.toISOString(),
            checkOut: checkOut.toISOString(),
            calculation,
            explanation: {
                regularHours: `${calculation.regularHours}h (tối đa 8h/ngày)`,
                overtimeHours: `${calculation.overtimeHours}h (trên 8h)`,
                lateMinutes: calculation.lateMinutes > 0 ? `${calculation.lateMinutes} phút muộn` : 'Đúng giờ',
                earlyLeaveMinutes: calculation.earlyLeaveMinutes > 0 ? `${calculation.earlyLeaveMinutes} phút về sớm` : 'Đúng giờ',
                status: calculation.status,
            }
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(1, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(2, (0, typeorm_1.InjectRepository)(work_location_entity_1.WorkLocation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        working_hours_calculator_service_1.WorkingHoursCalculator,
        attendance_rule_engine_service_1.AttendanceRuleEngine])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map