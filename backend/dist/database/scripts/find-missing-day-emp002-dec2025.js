"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function findMissingDay() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const employeeResult = await queryRunner.query(`SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`);
        if (employeeResult.length === 0) {
            console.log('❌ Employee EMP002 not found.');
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        const employeeId = employeeResult[0].id;
        const year = 2025;
        const month = 12;
        const existingAttendances = await queryRunner.query(`SELECT date::text as date_str FROM attendances WHERE "employeeId" = $1 AND date >= $2::date AND date < $3::date ORDER BY date`, [employeeId, `${year}-${String(month).padStart(2, '0')}-01`, `2026-01-01`]);
        const existingDates = new Set(existingAttendances.map((a) => a.date_str));
        console.log(`📅 Existing attendance dates: ${existingAttendances.length} days`);
        existingAttendances.forEach((a) => {
            console.log(`   - ${a.date_str}`);
        });
        const daysInMonth = new Date(year, month, 0).getDate();
        const workingDays = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month - 1, day);
            const dayOfWeek = currentDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                workingDays.push(dateStr);
            }
        }
        console.log(`\n📅 Total working days in December 2025: ${workingDays.length} days`);
        const missingDays = workingDays.filter(date => !existingDates.has(date));
        console.log(`\n❌ Missing days: ${missingDays.length}`);
        if (missingDays.length > 0) {
            missingDays.forEach(date => {
                console.log(`   - ${date}`);
            });
        }
        else {
            console.log(`   All working days have attendance records.`);
        }
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
    }
    catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}
findMissingDay();
//# sourceMappingURL=find-missing-day-emp002-dec2025.js.map