import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function addEmp002Dec1_2025() {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Find employee EMP002
    const employeeResult = await queryRunner.query(
      `SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`
    );

    if (employeeResult.length === 0) {
      console.log('❌ Employee EMP002 not found. Please create the employee first.');
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }

    const employeeId = employeeResult[0].id;
    console.log(`✅ Found employee EMP002 with ID: ${employeeId}`);

    // Date: 2025-12-01
    const dateStr = '2025-12-01';
    
    // Check if attendance already exists for this date
    const existingAttendance = await queryRunner.query(
      `SELECT id FROM attendances WHERE "employeeId" = $1 AND date = $2`,
      [employeeId, dateStr]
    );

    if (existingAttendance.length > 0) {
      console.log(`⏭️  Attendance already exists for ${dateStr}. Skipping.`);
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }

    // Set check-in time to 8:00 AM (local time)
    const checkIn = new Date('2025-12-01T08:00:00');
    
    // Set check-out time to 5:00 PM (8 hours working + 1 hour lunch break)
    const checkOut = new Date('2025-12-01T17:00:00');

    // Format dates for PostgreSQL
    const checkInStr = checkIn.toISOString();
    const checkOutStr = checkOut.toISOString();
    
    await queryRunner.query(
      `INSERT INTO attendances (
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
      )`,
      [employeeId, dateStr, checkInStr, checkOutStr]
    );

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log(`✅ Successfully added attendance for ${dateStr}`);
    console.log('✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addEmp002Dec1_2025();

