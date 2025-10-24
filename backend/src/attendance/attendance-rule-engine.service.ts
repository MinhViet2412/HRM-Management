import { Injectable } from '@nestjs/common';

export interface AttendanceRule {
  rule_id: string;
  description: string;
  condition: string;
  result: string;
  priority?: number;
}

export interface AttendanceEvaluation {
  matchedRule: AttendanceRule | null;
  result: string;
  status: string;
  details: {
    checkIn: string | null;
    checkOut: string | null;
    workHours: number;
    evaluationTime: string;
  };
}

@Injectable()
export class AttendanceRuleEngine {
  private rules: AttendanceRule[] = [
    {
      rule_id: "on_time_shift_1",
      description: "Đi đúng giờ Ca 1 (08:00-15:00)",
      condition: "check_in <= '08:00' AND check_out >= '15:00'",
      result: "Đúng giờ (Ca 1)",
      priority: 1
    },
    {
      rule_id: "on_time_shift_2", 
      description: "Đi đúng giờ Ca 2 (09:00-18:00)",
      condition: "check_in <= '09:00' AND check_out >= '18:00'",
      result: "Đúng giờ (Ca 2)",
      priority: 2
    },
    {
      rule_id: "early_checkout",
      description: "Về sớm (< 17:00)",
      condition: "check_out < '17:00' AND NOT (check_in <= '08:00' AND check_out >= '15:00') AND NOT (check_in >= '08:00' AND check_out <= '18:00' AND work_hours >= 7)",
      result: "Về sớm",
      priority: 3
    },
    {
      rule_id: "late_checkin",
      description: "Đi trễ (> 09:00)",
      condition: "check_in > '09:00'",
      result: "Đi trễ",
      priority: 4
    },
    {
      rule_id: "flexible_shift",
      description: "Ca linh hoạt (≥7h trong khung 08:00-18:00)",
      condition: "check_in >= '08:00' AND check_out <= '18:00' AND work_hours >= 7",
      result: "Đúng giờ (Ca linh động)",
      priority: 5
    },
    {
      rule_id: "missing_checkout",
      description: "Chưa chấm công ra",
      condition: "check_in IS NOT NULL AND check_out IS NULL",
      result: "Thiếu công",
      priority: 6
    },
    {
      rule_id: "absent",
      description: "Không có chấm công trong ngày",
      condition: "check_in IS NULL AND check_out IS NULL",
      result: "Vắng mặt",
      priority: 7
    }
  ];

  /**
   * Evaluate attendance against all rules
   */
  evaluateAttendance(
    checkIn: Date | null,
    checkOut: Date | null
  ): AttendanceEvaluation {
    const checkInTime = checkIn ? this.formatTime(checkIn) : null;
    const checkOutTime = checkOut ? this.formatTime(checkOut) : null;
    const workHours = this.calculateWorkHours(checkIn, checkOut);

    const context = {
      check_in: checkInTime,
      check_out: checkOutTime,
      work_hours: workHours
    };

    // Sort rules by priority (lower number = higher priority)
    const sortedRules = [...this.rules].sort((a, b) => (a.priority || 999) - (b.priority || 999));

    // Find the first matching rule
    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, context)) {
        return {
          matchedRule: rule,
          result: rule.result,
          status: this.mapResultToStatus(rule.result),
          details: {
            checkIn: checkInTime,
            checkOut: checkOutTime,
            workHours,
            evaluationTime: new Date().toISOString()
          }
        };
      }
    }

    // Default case - should not happen with complete rule set
    return {
      matchedRule: null,
      result: "Không xác định",
      status: "unknown",
      details: {
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours,
        evaluationTime: new Date().toISOString()
      }
    };
  }

  /**
   * Evaluate a condition string against context
   */
  private evaluateCondition(condition: string, context: any): boolean {
    try {
      // Replace placeholders with actual values
      let processedCondition = condition;
      
      // Handle time comparisons
      processedCondition = processedCondition.replace(
        /check_in\s*([<>=!]+)\s*'([^']+)'/g,
        (match, operator, timeStr) => {
          const checkInTime = context.check_in;
          if (!checkInTime) return 'false';
          return this.compareTimes(checkInTime, operator, timeStr);
        }
      );

      processedCondition = processedCondition.replace(
        /check_out\s*([<>=!]+)\s*'([^']+)'/g,
        (match, operator, timeStr) => {
          const checkOutTime = context.check_out;
          if (!checkOutTime) return 'false';
          return this.compareTimes(checkOutTime, operator, timeStr);
        }
      );

      // Handle work_hours comparisons
      processedCondition = processedCondition.replace(
        /work_hours\s*([<>=!]+)\s*(\d+)/g,
        (match, operator, hours) => {
          const workHours = context.work_hours;
          return this.compareNumbers(workHours, operator, parseFloat(hours));
        }
      );

      // Handle NULL checks
      processedCondition = processedCondition.replace(
        /check_in\s+IS\s+NOT\s+NULL/g,
        context.check_in !== null ? 'true' : 'false'
      );
      processedCondition = processedCondition.replace(
        /check_in\s+IS\s+NULL/g,
        context.check_in === null ? 'true' : 'false'
      );
      processedCondition = processedCondition.replace(
        /check_out\s+IS\s+NOT\s+NULL/g,
        context.check_out !== null ? 'true' : 'false'
      );
      processedCondition = processedCondition.replace(
        /check_out\s+IS\s+NULL/g,
        context.check_out === null ? 'true' : 'false'
      );

      // Handle NOT conditions
      processedCondition = processedCondition.replace(/NOT\s*\(([^)]+)\)/g, (match, innerCondition) => {
        const innerResult = this.evaluateCondition(innerCondition, context);
        return innerResult ? 'false' : 'true';
      });

      // Evaluate the final boolean expression
      return this.evaluateBooleanExpression(processedCondition);
    } catch (error) {
      console.error('Error evaluating condition:', condition, error);
      return false;
    }
  }

  /**
   * Compare two time strings
   */
  private compareTimes(time1: string, operator: string, time2: string): string {
    const t1 = this.timeToMinutes(time1);
    const t2 = this.timeToMinutes(time2);

    switch (operator) {
      case '<=': return (t1 <= t2).toString();
      case '>=': return (t1 >= t2).toString();
      case '<': return (t1 < t2).toString();
      case '>': return (t1 > t2).toString();
      case '=': return (t1 === t2).toString();
      case '!=': return (t1 !== t2).toString();
      default: return 'false';
    }
  }

  /**
   * Compare two numbers
   */
  private compareNumbers(num1: number, operator: string, num2: number): string {
    switch (operator) {
      case '<=': return (num1 <= num2).toString();
      case '>=': return (num1 >= num2).toString();
      case '<': return (num1 < num2).toString();
      case '>': return (num1 > num2).toString();
      case '=': return (num1 === num2).toString();
      case '!=': return (num1 !== num2).toString();
      default: return 'false';
    }
  }

  /**
   * Convert time string (HH:mm) to minutes since midnight
   */
  private timeToMinutes(timeStr: string): number {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert Date to time string (HH:mm) in local timezone (UTC+7)
   */
  private formatTime(date: Date): string {
    // Convert UTC to local timezone (UTC+7 for Vietnam)
    const localDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    const hours = localDate.getUTCHours().toString().padStart(2, '0');
    const minutes = localDate.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Calculate work hours between two dates
   */
  private calculateWorkHours(checkIn: Date | null, checkOut: Date | null): number {
    if (!checkIn || !checkOut) return 0;
    const diffMs = checkOut.getTime() - checkIn.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }

  /**
   * Evaluate boolean expression (simple AND/OR logic)
   */
  private evaluateBooleanExpression(expression: string): boolean {
    // Replace AND/OR with JavaScript operators
    let processed = expression
      .replace(/\bAND\b/g, '&&')
      .replace(/\bOR\b/g, '||')
      .replace(/\btrue\b/g, 'true')
      .replace(/\bfalse\b/g, 'false');

    try {
      // Use Function constructor to safely evaluate the expression
      return new Function('return ' + processed)();
    } catch (error) {
      console.error('Error evaluating boolean expression:', processed, error);
      return false;
    }
  }

  /**
   * Map result string to status enum
   */
  private mapResultToStatus(result: string): string {
    if (result.includes('Đúng giờ')) return 'present';
    if (result.includes('Đi trễ')) return 'late';
    if (result.includes('Về sớm')) return 'early_leave';
    if (result.includes('Thiếu công')) return 'missing_checkout';
    if (result.includes('Vắng mặt')) return 'absent';
    return 'unknown';
  }

  /**
   * Get all rules
   */
  getAllRules(): AttendanceRule[] {
    return [...this.rules];
  }

  /**
   * Add a new rule
   */
  addRule(rule: AttendanceRule): void {
    this.rules.push(rule);
  }

  /**
   * Update a rule
   */
  updateRule(ruleId: string, updatedRule: Partial<AttendanceRule>): boolean {
    const index = this.rules.findIndex(rule => rule.rule_id === ruleId);
    if (index !== -1) {
      this.rules[index] = { ...this.rules[index], ...updatedRule };
      return true;
    }
    return false;
  }

  /**
   * Remove a rule
   */
  removeRule(ruleId: string): boolean {
    const index = this.rules.findIndex(rule => rule.rule_id === ruleId);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }
}
