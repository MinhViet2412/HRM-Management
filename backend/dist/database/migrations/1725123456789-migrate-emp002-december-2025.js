"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigrateEmp002December20251725123456789 = void 0;
class MigrateEmp002December20251725123456789 {
    constructor() {
        this.name = 'MigrateEmp002December20251725123456789';
    }
    async up(queryRunner) {
        const employeeResult = await queryRunner.query(`SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`);
        if (employeeResult.length === 0) {
            console.log('Employee EMP002 not found. Skipping migration.');
            return;
        }
        const employeeId = employeeResult[0].id;
        const workingDays = [];
        const year = 2025;
        const month = 11;
        for (let day = 1; day <= 31; day++) {
            const date = new Date(year, month, day);
            if (date.getMonth() !== month) {
                break;
            }
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                workingDays.push(date);
            }
        }
        for (const date of workingDays) {
            const dateStr = date.toISOString().split('T')[0];
            const checkIn = new Date(date);
            checkIn.setHours(8, 0, 0, 0);
            const checkOut = new Date(date);
            checkOut.setHours(17, 0, 0, 0);
            const existingAttendance = await queryRunner.query(`SELECT id FROM attendances WHERE "employeeId" = $1 AND date = $2`, [employeeId, dateStr]);
            if (existingAttendance.length === 0) {
                const checkInStr = checkIn.toISOString();
                const checkOutStr = checkOut.toISOString();
                await queryRunner.query(`INSERT INTO attendances (
            id,
            "employeeId",
            date,
            "checkIn",
            "checkOut",
            "workingHours",
            "overtimeHours",
            status,
            "createdAt",
            "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            $1,
            $2::date,
            $3::timestamp,
            $4::timestamp,
            8.00,
            0.00,
            'present',
            NOW(),
            NOW()
          )`, [employeeId, dateStr, checkInStr, checkOutStr]);
            }
            else {
                console.log(`Attendance already exists for ${dateStr}. Skipping.`);
            }
        }
        console.log(`Successfully migrated ${workingDays.length} attendance records for EMP002 in December 2025.`);
    }
    async down(queryRunner) {
        const employeeResult = await queryRunner.query(`SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`);
        if (employeeResult.length === 0) {
            return;
        }
        const employeeId = employeeResult[0].id;
        await queryRunner.query(`DELETE FROM attendances 
       WHERE "employeeId" = $1 
       AND date >= '2025-12-01' 
       AND date <= '2025-12-31'`, [employeeId]);
        console.log('Rolled back attendance records for EMP002 in December 2025.');
    }
}
exports.MigrateEmp002December20251725123456789 = MigrateEmp002December20251725123456789;
//# sourceMappingURL=1725123456789-migrate-emp002-december-2025.js.map