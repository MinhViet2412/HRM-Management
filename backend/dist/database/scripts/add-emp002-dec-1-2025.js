"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function addEmp002Dec1_2025() {
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
        const dateStr = '2025-12-01';
        const existingAttendance = await queryRunner.query(`SELECT id FROM attendances WHERE "employeeId" = $1 AND date = $2`, [employeeId, dateStr]);
        if (existingAttendance.length > 0) {
            console.log(`⏭️  Attendance already exists for ${dateStr}. Skipping.`);
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        const checkIn = new Date('2025-12-01T08:00:00');
        const checkOut = new Date('2025-12-01T17:00:00');
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
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
        console.log(`✅ Successfully added attendance for ${dateStr}`);
        console.log('✨ Migration completed successfully!');
    }
    catch (error) {
        console.error('❌ Error during migration:', error);
        process.exit(1);
    }
}
addEmp002Dec1_2025();
//# sourceMappingURL=add-emp002-dec-1-2025.js.map