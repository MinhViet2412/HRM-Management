import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function migrateEmp002December2025() {
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

    // Generate all working days in December 2025 (excluding Saturday and Sunday)
    const workingDays: Date[] = [];
    const year = 2025;
    const month = 11; // December (0-indexed)

    // Get all days in December 2025
    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      
      // Check if date is valid (handles cases where day doesn't exist in month)
      if (date.getMonth() !== month) {
        break;
      }

      const dayOfWeek = date.getDay();
      // Exclude Saturday (6) and Sunday (0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays.push(date);
      }
    }

    console.log(`📅 Found ${workingDays.length} working days in December 2025 (excluding weekends)`);

    let insertedCount = 0;
    let skippedCount = 0;

    // Insert attendance records for each working day
    for (const date of workingDays) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Set check-in time to 8:00 AM (local time)
      const checkIn = new Date(date);
      checkIn.setHours(8, 0, 0, 0);
      
      // Set check-out time to 5:00 PM (8 hours working + 1 hour lunch break)
      const checkOut = new Date(date);
      checkOut.setHours(17, 0, 0, 0);

      // Check if attendance already exists for this date
      const existingAttendance = await queryRunner.query(
        `SELECT id FROM attendances WHERE "employeeId" = $1 AND date = $2`,
        [employeeId, dateStr]
      );

      if (existingAttendance.length === 0) {
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
        insertedCount++;
        console.log(`✅ Inserted attendance for ${dateStr}`);
      } else {
        skippedCount++;
        console.log(`⏭️  Attendance already exists for ${dateStr}. Skipping.`);
      }
    }

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Inserted: ${insertedCount} records`);
    console.log(`   ⏭️  Skipped: ${skippedCount} records`);
    console.log(`   📅 Total working days: ${workingDays.length}`);
    console.log('\n✨ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
migrateEmp002December2025();

