"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function migrateEmp002December2025() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const employeeResult = await queryRunner.query(`SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`);
        if (employeeResult.length === 0) {
            console.log('❌ Employee EMP002 not found. Please create the employee first.');
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        const employeeId = employeeResult[0].id;
        console.log(`✅ Found employee EMP002 with ID: ${employeeId}`);
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
        console.log(`📅 Found ${workingDays.length} working days in December 2025 (excluding weekends)`);
        let insertedCount = 0;
        let skippedCount = 0;
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
                insertedCount++;
                console.log(`✅ Inserted attendance for ${dateStr}`);
            }
            else {
                skippedCount++;
                console.log(`⏭️  Attendance already exists for ${dateStr}. Skipping.`);
            }
        }
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
        console.log('\n📊 Migration Summary:');
        console.log(`   ✅ Inserted: ${insertedCount} records`);
        console.log(`   ⏭️  Skipped: ${skippedCount} records`);
        console.log(`   📅 Total working days: ${workingDays.length}`);
        console.log('\n✨ Migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}
migrateEmp002December2025();
//# sourceMappingURL=migrate-emp002-december-2025.js.map