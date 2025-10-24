import { Shift } from '../database/entities/shift.entity';
export interface WorkingHoursCalculation {
    regularHours: number;
    overtimeHours: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    status: 'on_time' | 'late' | 'early_leave' | 'late_and_early';
}
export declare class WorkingHoursCalculator {
    calculateWorkingHours(checkInTime: Date, checkOutTime: Date, shift: Shift): WorkingHoursCalculation;
    private parseTimeString;
    private getTimeFromDate;
    private addMinutes;
    private isTimeAfter;
    private isTimeBefore;
    private getMinutesDifference;
    formatTime(time: {
        hours: number;
        minutes: number;
    }): string;
    formatMinutesToHours(minutes: number): string;
}
