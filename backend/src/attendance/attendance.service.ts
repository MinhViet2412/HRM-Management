import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Attendance, AttendanceStatus } from '../database/entities/attendance.entity';
import { Employee } from '../database/entities/employee.entity';
import { WorkLocation } from '../database/entities/work-location.entity';
import { CheckInDto } from './dto/check-in.dto';
import { CheckOutDto } from './dto/check-out.dto';
import { AdjustAttendanceDto } from './dto/adjust-attendance.dto';
import { WorkingHoursCalculator } from './working-hours-calculator.service';
import { AttendanceRuleEngine } from './attendance-rule-engine.service';
import { ManualAttendanceDto } from './dto/manual-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(WorkLocation)
    private workLocationRepository: Repository<WorkLocation>,
    private workingHoursCalculator: WorkingHoursCalculator,
    private attendanceRuleEngine: AttendanceRuleEngine,
  ) {}

  async checkIn(employeeId: string, checkInDto: CheckInDto): Promise<Attendance> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['workLocation', 'shift'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    if (existingAttendance && existingAttendance.checkIn) {
      throw new ConflictException('Already checked in today');
    }

    const checkInTime = checkInDto.checkInTime || new Date();

    // Evaluate attendance using rule engine
    const evaluation = this.attendanceRuleEngine.evaluateAttendance(checkInTime, null);
    
    // Map evaluation status to AttendanceStatus enum
    let status = AttendanceStatus.PRESENT;
    switch (evaluation.status) {
      case 'late':
        status = AttendanceStatus.LATE;
        break;
      case 'absent':
        status = AttendanceStatus.ABSENT;
        break;
      case 'missing_checkout':
        status = AttendanceStatus.PRESENT; // Will be updated on checkout
        break;
      default:
        status = AttendanceStatus.PRESENT;
    }

    // If employee has assigned work location, validate coordinates
    if (employee.workLocation) {
      const { latitude: wlLat, longitude: wlLng, radius } = employee.workLocation;
      const { latitude: lat, longitude: lng } = checkInDto as any;
      if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new BadRequestException('Missing latitude/longitude for geo check-in');
      }
      const distance = this.calculateDistanceMeters(Number(wlLat), Number(wlLng), lat, lng);
      if (distance > radius) {
        throw new BadRequestException('You are not within the allowed work location radius');
      }
    }

    if (existingAttendance) {
      existingAttendance.checkIn = checkInTime;
      existingAttendance.status = status;
      existingAttendance.notes = checkInDto.notes || existingAttendance.notes;
      return this.attendanceRepository.save(existingAttendance);
    } else {
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

  async testAttendanceRules(
    checkIn: Date | null,
    checkOut: Date | null
  ): Promise<any> {
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

  async getAllAttendanceRules(): Promise<any> {
    return {
      rules: this.attendanceRuleEngine.getAllRules(),
      totalRules: this.attendanceRuleEngine.getAllRules().length
    };
  }

  async reEvaluateAttendanceRecords(
    startDate?: Date,
    endDate?: Date,
    departmentId?: string,
  ): Promise<any> {
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
        const evaluation = this.attendanceRuleEngine.evaluateAttendance(
          attendance.checkIn,
          attendance.checkOut
        );

        // Update status based on evaluation
        let newStatus = attendance.status;
        switch (evaluation.status) {
          case 'late':
            newStatus = AttendanceStatus.LATE;
            break;
          case 'early_leave':
            newStatus = AttendanceStatus.EARLY_LEAVE;
            break;
          case 'present':
            newStatus = AttendanceStatus.PRESENT;
            break;
          case 'absent':
            newStatus = AttendanceStatus.ABSENT;
            break;
        }

        if (newStatus !== attendance.status) {
          attendance.status = newStatus;
          
          // Add evaluation note
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

  private calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // meters
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  async checkOut(employeeId: string, checkOutDto: CheckOutDto): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    if (!attendance) {
      throw new NotFoundException('No attendance record found for today');
    }

    if (!attendance.checkIn) {
      throw new BadRequestException('Must check in before checking out');
    }

    if (attendance.checkOut) {
      throw new ConflictException('Already checked out today');
    }

    const checkOutTime = checkOutDto.checkOutTime || new Date();
    attendance.checkOut = checkOutTime;

    // Evaluate attendance using rule engine
    const evaluation = this.attendanceRuleEngine.evaluateAttendance(
      attendance.checkIn,
      checkOutTime
    );

    // Update status based on rule evaluation
    switch (evaluation.status) {
      case 'late':
        attendance.status = AttendanceStatus.LATE;
        break;
      case 'early_leave':
        attendance.status = AttendanceStatus.EARLY_LEAVE;
        break;
      case 'missing_checkout':
        attendance.status = AttendanceStatus.PRESENT;
        break;
      default:
        attendance.status = AttendanceStatus.PRESENT;
    }

    // Calculate working hours
    const workingMs = checkOutTime.getTime() - attendance.checkIn.getTime();
    const workingHours = workingMs / (1000 * 60 * 60);
    
    attendance.workingHours = Math.round(workingHours * 100) / 100;
    attendance.overtimeHours = Math.max(0, workingHours - 8);

    // Add rule evaluation details to notes
    const ruleNote = `Rule: ${evaluation.result} (${evaluation.matchedRule?.rule_id})`;
    attendance.notes = attendance.notes 
      ? `${attendance.notes}\n${ruleNote}`
      : ruleNote;

    attendance.notes = checkOutDto.notes || attendance.notes;

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceByEmployee(employeeId: string, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const query: any = { employeeId };

    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    }

    return this.attendanceRepository.find({
      where: query,
      order: { date: 'DESC' },
    });
  }

  async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.attendanceRepository.find({
      where: {
        date: Between(startOfDay, endOfDay),
      },
      relations: ['employee'],
      order: { checkIn: 'ASC' },
    });
  }

  async getAttendanceWithFilters(startDate: Date, endDate: Date, departmentId?: string): Promise<Attendance[]> {
    const startOfDay = new Date(startDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      date: Between(startOfDay, endOfDay),
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

  async closeMissingCheckout(employeeId: string, date: Date, approvedBy: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date,
      },
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    if (!attendance.checkIn) {
      throw new BadRequestException('Employee did not check in');
    }

    if (attendance.checkOut) {
      throw new BadRequestException('Employee already checked out');
    }

    // Set checkout to end of working day (6:00 PM)
    const endOfDay = new Date(date);
    endOfDay.setHours(18, 0, 0, 0);

    attendance.checkOut = endOfDay;
    attendance.approvedBy = approvedBy;
    attendance.approvedAt = new Date();

    // Calculate working hours
    const workingMs = endOfDay.getTime() - attendance.checkIn.getTime();
    const workingHours = workingMs / (1000 * 60 * 60);
    attendance.workingHours = Math.round(workingHours * 100) / 100;

    return this.attendanceRepository.save(attendance);
  }

  async getAttendanceSummary(employeeId: string, startDate: Date, endDate: Date): Promise<any> {
    const attendances = await this.getAttendanceByEmployee(employeeId, startDate, endDate);

    const summary = {
      totalDays: attendances.length,
      presentDays: attendances.filter(a => a.status === AttendanceStatus.PRESENT).length,
      lateDays: attendances.filter(a => a.status === AttendanceStatus.LATE).length,
      absentDays: attendances.filter(a => a.status === AttendanceStatus.ABSENT).length,
      halfDays: attendances.filter(a => a.status === AttendanceStatus.HALF_DAY).length,
      totalWorkingHours: attendances.reduce((sum, a) => sum + (a.workingHours || 0), 0),
      totalOvertimeHours: attendances.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
    };

    return summary;
  }

  async manualUpsert(dto: ManualAttendanceDto, userId: string): Promise<Attendance> {
    let employeeId = dto.employeeId;
    if (!employeeId && dto.employeeCode) {
      const emp = await this.employeeRepository.findOne({ where: { employeeCode: dto.employeeCode } });
      if (!emp) throw new NotFoundException('Employee not found');
      employeeId = emp.id;
    }
    if (!employeeId) throw new BadRequestException('employeeId or employeeCode is required');

    const date = new Date(dto.date);
    date.setHours(0,0,0,0);

    let record = await this.attendanceRepository.findOne({ where: { employeeId, date } });

    const newIn = dto.checkIn ? new Date(dto.checkIn) : undefined;
    const newOut = dto.checkOut ? new Date(dto.checkOut) : undefined;

    // Rule: If there is an existing attendance with time(s) on this date, and the provided time overlaps
    // or duplicates it, reject and ask user to use the adjust endpoint instead of manual add
    if (record && (record.checkIn || record.checkOut)) {
      if (!newIn && !newOut) {
        throw new ConflictException('Đã có chấm công trong ngày này. Vui lòng dùng chức năng điều chỉnh.');
      }

      const existIn = record.checkIn ? new Date(record.checkIn) : undefined;
      const existOut = record.checkOut ? new Date(record.checkOut) : undefined;

      // overlap check if we have both ranges
      const overlaps = () => {
        if (existIn && existOut && newIn && newOut) {
          return Math.max(existIn.getTime(), newIn.getTime()) < Math.min(existOut.getTime(), newOut.getTime());
        }
        // equality checks when any side is point-in-time
        if (existIn && newIn && existIn.getTime() === newIn.getTime()) return true;
        if (existOut && newOut && existOut.getTime() === newOut.getTime()) return true;
        // new range covers existing points
        if (newIn && newOut && existIn && newIn.getTime() <= existIn.getTime() && existIn.getTime() <= newOut.getTime()) return true;
        if (newIn && newOut && existOut && newIn.getTime() <= existOut.getTime() && existOut.getTime() <= newOut.getTime()) return true;
        // existing range covers new points
        if (existIn && existOut && newIn && existIn.getTime() <= newIn.getTime() && newIn.getTime() <= existOut.getTime()) return true;
        if (existIn && existOut && newOut && existIn.getTime() <= newOut.getTime() && newOut.getTime() <= existOut.getTime()) return true;
        return false;
      };

      if (overlaps()) {
        throw new ConflictException('Giờ công bạn nhập trùng với giờ công nhân viên đã có, vui lòng nhập giờ công khác');
      }

      // If it does not overlap but record exists, also block to preserve uniqueness per day via manual add
      throw new ConflictException('Đã tồn tại bản ghi chấm công trong ngày. Vui lòng điều chỉnh thay vì tạo mới.');
    }

    if (!record) {
      record = this.attendanceRepository.create({ employeeId, date });
    }

    if (newIn) record.checkIn = newIn;
    if (newOut) record.checkOut = newOut;
    record.notes = dto.notes ?? record.notes;

    if (record.checkIn && record.checkOut) {
      const ms = record.checkOut.getTime() - record.checkIn.getTime();
      const hours = ms / (1000*60*60);
      record.workingHours = Math.round(Math.min(hours, 24) * 100) / 100;
      record.overtimeHours = Math.max(0, record.workingHours - 8);
      record.status = AttendanceStatus.PRESENT;
    }

    return this.attendanceRepository.save(record);
  }

  async adjustAttendance(
    attendanceId: string,
    adjustDto: AdjustAttendanceDto,
    adjustedBy: string,
  ): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
      relations: ['employee', 'employee.shift'],
    });

    if (!attendance) {
      throw new NotFoundException('Attendance record not found');
    }

    // Update check-in time if provided
    if (adjustDto.checkIn) {
      attendance.checkIn = new Date(adjustDto.checkIn);
    }

    // Update check-out time if provided
    if (adjustDto.checkOut) {
      attendance.checkOut = new Date(adjustDto.checkOut);
    }

    // Update status if provided
    if (adjustDto.status) {
      attendance.status = adjustDto.status;
    }

    // Update notes if provided
    if (adjustDto.notes !== undefined) {
      attendance.notes = adjustDto.notes;
    }

    // Recalculate working hours if check-in or check-out changed
    if (adjustDto.checkIn || adjustDto.checkOut) {
      if (attendance.checkIn && attendance.checkOut && attendance.employee?.shift) {
        const calculation = this.workingHoursCalculator.calculateWorkingHours(
          attendance.checkIn,
          attendance.checkOut,
          attendance.employee.shift
        );
        
        attendance.workingHours = calculation.regularHours;
        attendance.overtimeHours = calculation.overtimeHours;
        
        // Update status based on calculation
        if (calculation.status === 'late' || calculation.status === 'late_and_early') {
          attendance.status = AttendanceStatus.LATE;
        }
        
        // Add calculation details to notes
        const calculationNote = `Late: ${calculation.lateMinutes}m, Early leave: ${calculation.earlyLeaveMinutes}m`;
        attendance.notes = attendance.notes 
          ? `${attendance.notes}\n${calculationNote}`
          : calculationNote;
      } else if (attendance.checkIn && attendance.checkOut) {
        // Fallback calculation
        const checkInTime = new Date(attendance.checkIn);
        const checkOutTime = new Date(attendance.checkOut);
        const diffMs = checkOutTime.getTime() - checkInTime.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        
        attendance.workingHours = Math.min(diffHours, 8);
        attendance.overtimeHours = Math.max(0, diffHours - 8);
      }
    }

    // Add adjustment reason to notes
    if (adjustDto.reason) {
      const adjustmentNote = `[ADJUSTED by ${adjustedBy}]: ${adjustDto.reason}`;
      attendance.notes = attendance.notes 
        ? `${attendance.notes}\n${adjustmentNote}`
        : adjustmentNote;
    }

    return this.attendanceRepository.save(attendance);
  }

  async testWorkingHoursCalculation(
    checkInTime: string,
    checkOutTime: string,
    shiftId: string,
  ): Promise<any> {
    const shift = await this.attendanceRepository.query(
      'SELECT * FROM shifts WHERE id = $1',
      [shiftId]
    );

    if (!shift || shift.length === 0) {
      throw new NotFoundException('Shift not found');
    }

    const shiftData = shift[0];
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);

    const calculation = this.workingHoursCalculator.calculateWorkingHours(
      checkIn,
      checkOut,
      shiftData
    );

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
}
