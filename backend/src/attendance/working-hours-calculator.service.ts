import { Injectable } from '@nestjs/common';
import { Shift } from '../database/entities/shift.entity';

export interface WorkingHoursCalculation {
  regularHours: number;
  overtimeHours: number;
  lateMinutes: number;
  earlyLeaveMinutes: number;
  status: 'on_time' | 'late' | 'early_leave' | 'late_and_early';
}

@Injectable()
export class WorkingHoursCalculator {
  
  /**
   * Calculate working hours based on shift rules
   * @param checkInTime - Employee check-in time
   * @param checkOutTime - Employee check-out time
   * @param shift - Employee's assigned shift
   * @returns WorkingHoursCalculation
   */
  calculateWorkingHours(
    checkInTime: Date,
    checkOutTime: Date,
    shift: Shift
  ): WorkingHoursCalculation {
    // Parse shift times
    const shiftStart = this.parseTimeString(shift.startTime);
    const shiftEnd = this.parseTimeString(shift.endTime);
    const lunchStart = shift.lunchBreakStart ? this.parseTimeString(shift.lunchBreakStart) : null;
    const lunchEnd = shift.lunchBreakEnd ? this.parseTimeString(shift.lunchBreakEnd) : null;

    // Get check-in/out times
    const checkIn = this.getTimeFromDate(checkInTime);
    const checkOut = this.getTimeFromDate(checkOutTime);

    // Calculate late minutes (if check-in after shift start + 15 minutes grace period)
    const gracePeriodMinutes = 15;
    const lateThreshold = this.addMinutes(shiftStart, gracePeriodMinutes);
    const lateMinutes = this.isTimeAfter(checkIn, lateThreshold) 
      ? this.getMinutesDifference(lateThreshold, checkIn) 
      : 0;

    // Calculate early leave minutes (if check-out before shift end)
    const earlyLeaveMinutes = this.isTimeBefore(checkOut, shiftEnd)
      ? this.getMinutesDifference(checkOut, shiftEnd)
      : 0;

    // Determine status
    let status: WorkingHoursCalculation['status'] = 'on_time';
    if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
      status = 'late_and_early';
    } else if (lateMinutes > 0) {
      status = 'late';
    } else if (earlyLeaveMinutes > 0) {
      status = 'early_leave';
    }

    // Calculate actual working time
    const totalMinutes = this.getMinutesDifference(checkIn, checkOut);
    
    // Subtract lunch break if applicable
    let workingMinutes = totalMinutes;
    if (lunchStart && lunchEnd) {
      const lunchMinutes = this.getMinutesDifference(lunchStart, lunchEnd);
      workingMinutes = Math.max(0, totalMinutes - lunchMinutes);
    }

    // Convert to hours
    const totalWorkingHours = workingMinutes / 60;

    // Calculate regular hours (8 hours max per day)
    const regularHours = Math.min(totalWorkingHours, 8);
    
    // Calculate overtime hours (anything over 8 hours)
    const overtimeHours = Math.max(0, totalWorkingHours - 8);

    return {
      regularHours: Math.round(regularHours * 100) / 100, // Round to 2 decimal places
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      lateMinutes,
      earlyLeaveMinutes,
      status
    };
  }

  /**
   * Parse time string (HH:mm) to hours and minutes
   */
  private parseTimeString(timeString: string): { hours: number; minutes: number } {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  }

  /**
   * Get time from Date object
   */
  private getTimeFromDate(date: Date): { hours: number; minutes: number } {
    return {
      hours: date.getHours(),
      minutes: date.getMinutes()
    };
  }

  /**
   * Add minutes to a time
   */
  private addMinutes(time: { hours: number; minutes: number }, minutes: number): { hours: number; minutes: number } {
    const totalMinutes = time.hours * 60 + time.minutes + minutes;
    return {
      hours: Math.floor(totalMinutes / 60) % 24,
      minutes: totalMinutes % 60
    };
  }

  /**
   * Check if time1 is after time2
   */
  private isTimeAfter(time1: { hours: number; minutes: number }, time2: { hours: number; minutes: number }): boolean {
    const minutes1 = time1.hours * 60 + time1.minutes;
    const minutes2 = time2.hours * 60 + time2.minutes;
    return minutes1 > minutes2;
  }

  /**
   * Check if time1 is before time2
   */
  private isTimeBefore(time1: { hours: number; minutes: number }, time2: { hours: number; minutes: number }): boolean {
    const minutes1 = time1.hours * 60 + time1.minutes;
    const minutes2 = time2.hours * 60 + time2.minutes;
    return minutes1 < minutes2;
  }

  /**
   * Get difference in minutes between two times
   */
  private getMinutesDifference(time1: { hours: number; minutes: number }, time2: { hours: number; minutes: number }): number {
    const minutes1 = time1.hours * 60 + time1.minutes;
    const minutes2 = time2.hours * 60 + time2.minutes;
    return Math.abs(minutes2 - minutes1);
  }

  /**
   * Format time for display
   */
  formatTime(time: { hours: number; minutes: number }): string {
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
  }

  /**
   * Format minutes to hours and minutes
   */
  formatMinutesToHours(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}
