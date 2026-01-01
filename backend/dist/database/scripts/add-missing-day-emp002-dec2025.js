"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function addMissingDay() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const employeeResult = await queryRunner.query(`SELECT id, "employeeCode", "firstName", "lastName" FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`);
        if (employeeResult.length === 0) {
            console.log('❌ Employee EMP002 not found.');
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        const employee = employeeResult[0];
        console.log(`✅ Found employee: ${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`);
        console.log(`   Employee ID: ${employee.id}`);
        const year = 2025;
        const month = 12;
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const existingAttendances = await queryRunner.query(`SELECT date::text as date_str FROM attendances WHERE "employeeId" = $1 AND date >= $2::date AND date < $3::date`, [employee.id, `${year}-${String(month).padStart(2, '0')}-01`, `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`]);
        const existingDates = new Set(existingAttendances.map((a) => a.date_str));
        console.log(`\n📅 Existing attendance dates: ${existingAttendances.length} days`);
        let foundDate = null;
        let dateStr = '';
        const missingDays = ['2025-12-05', '2025-12-12', '2025-12-19', '2025-12-26', '2025-12-31'];
        for (const missingDate of missingDays) {
            if (!existingDates.has(missingDate)) {
                const [y, m, d] = missingDate.split('-').map(Number);
                foundDate = new Date(y, m - 1, d);
                dateStr = missingDate;
                break;
            }
        }
        if (!foundDate) {
            console.log('❌ No available date found to add attendance.');
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        console.log(`\n📅 Adding attendance for: ${dateStr}`);
        const checkIn = new Date(foundDate);
        checkIn.setHours(8, 0, 0, 0);
        const checkOut = new Date(foundDate);
        checkOut.setHours(17, 0, 0, 0);
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
      )`, [employee.id, dateStr, checkInStr, checkOutStr]);
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
        console.log(`✅ Successfully added attendance for ${dateStr}`);
        console.log(`   Working Hours: 8.00 hours`);
        console.log(`\n✨ Migration completed successfully!`);
        console.log(`\n💡 Next step: Regenerate payroll to see updated calculations.`);
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}
addMissingDay();
//# sourceMappingURL=add-missing-day-emp002-dec2025.js.map