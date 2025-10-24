"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingHoursCalculator = void 0;
const common_1 = require("@nestjs/common");
let WorkingHoursCalculator = class WorkingHoursCalculator {
    calculateWorkingHours(checkInTime, checkOutTime, shift) {
        const shiftStart = this.parseTimeString(shift.startTime);
        const shiftEnd = this.parseTimeString(shift.endTime);
        const lunchStart = shift.lunchBreakStart ? this.parseTimeString(shift.lunchBreakStart) : null;
        const lunchEnd = shift.lunchBreakEnd ? this.parseTimeString(shift.lunchBreakEnd) : null;
        const checkIn = this.getTimeFromDate(checkInTime);
        const checkOut = this.getTimeFromDate(checkOutTime);
        const gracePeriodMinutes = 15;
        const lateThreshold = this.addMinutes(shiftStart, gracePeriodMinutes);
        const lateMinutes = this.isTimeAfter(checkIn, lateThreshold)
            ? this.getMinutesDifference(lateThreshold, checkIn)
            : 0;
        const earlyLeaveMinutes = this.isTimeBefore(checkOut, shiftEnd)
            ? this.getMinutesDifference(checkOut, shiftEnd)
            : 0;
        let status = 'on_time';
        if (lateMinutes > 0 && earlyLeaveMinutes > 0) {
            status = 'late_and_early';
        }
        else if (lateMinutes > 0) {
            status = 'late';
        }
        else if (earlyLeaveMinutes > 0) {
            status = 'early_leave';
        }
        const totalMinutes = this.getMinutesDifference(checkIn, checkOut);
        let workingMinutes = totalMinutes;
        if (lunchStart && lunchEnd) {
            const lunchMinutes = this.getMinutesDifference(lunchStart, lunchEnd);
            workingMinutes = Math.max(0, totalMinutes - lunchMinutes);
        }
        const totalWorkingHours = workingMinutes / 60;
        const regularHours = Math.min(totalWorkingHours, 8);
        const overtimeHours = Math.max(0, totalWorkingHours - 8);
        return {
            regularHours: Math.round(regularHours * 100) / 100,
            overtimeHours: Math.round(overtimeHours * 100) / 100,
            lateMinutes,
            earlyLeaveMinutes,
            status
        };
    }
    parseTimeString(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return { hours, minutes };
    }
    getTimeFromDate(date) {
        return {
            hours: date.getHours(),
            minutes: date.getMinutes()
        };
    }
    addMinutes(time, minutes) {
        const totalMinutes = time.hours * 60 + time.minutes + minutes;
        return {
            hours: Math.floor(totalMinutes / 60) % 24,
            minutes: totalMinutes % 60
        };
    }
    isTimeAfter(time1, time2) {
        const minutes1 = time1.hours * 60 + time1.minutes;
        const minutes2 = time2.hours * 60 + time2.minutes;
        return minutes1 > minutes2;
    }
    isTimeBefore(time1, time2) {
        const minutes1 = time1.hours * 60 + time1.minutes;
        const minutes2 = time2.hours * 60 + time2.minutes;
        return minutes1 < minutes2;
    }
    getMinutesDifference(time1, time2) {
        const minutes1 = time1.hours * 60 + time1.minutes;
        const minutes2 = time2.hours * 60 + time2.minutes;
        return Math.abs(minutes2 - minutes1);
    }
    formatTime(time) {
        return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}`;
    }
    formatMinutesToHours(minutes) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
};
exports.WorkingHoursCalculator = WorkingHoursCalculator;
exports.WorkingHoursCalculator = WorkingHoursCalculator = __decorate([
    (0, common_1.Injectable)()
], WorkingHoursCalculator);
//# sourceMappingURL=working-hours-calculator.service.js.map