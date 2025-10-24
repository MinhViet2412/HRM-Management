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
export declare class AttendanceRuleEngine {
    private rules;
    evaluateAttendance(checkIn: Date | null, checkOut: Date | null): AttendanceEvaluation;
    private evaluateCondition;
    private compareTimes;
    private compareNumbers;
    private timeToMinutes;
    private formatTime;
    private calculateWorkHours;
    private evaluateBooleanExpression;
    private mapResultToStatus;
    getAllRules(): AttendanceRule[];
    addRule(rule: AttendanceRule): void;
    updateRule(ruleId: string, updatedRule: Partial<AttendanceRule>): boolean;
    removeRule(ruleId: string): boolean;
}
