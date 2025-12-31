import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function addMissingDay() {
  try {
    // Initialize data source
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Find employee EMP002
    const employeeResult = await queryRunner.query(
      `SELECT id, "employeeCode", "firstName", "lastName" FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`
    );

    if (employeeResult.length === 0) {
      console.log('❌ Employee EMP002 not found.');
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }

    const employee = employeeResult[0];
    console.log(`✅ Found employee: ${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`);
    console.log(`   Employee ID: ${employee.id}`);

    const year = 2025;
    const month = 12;

    // Get all existing attendance dates for December 2025
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const existingAttendances = await queryRunner.query(
      `SELECT date::text as date_str FROM attendances WHERE "employeeId" = $1 AND date >= $2::date AND date < $3::date`,
      [employee.id, `${year}-${String(month).padStart(2, '0')}-01`, `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`]
    );

    const existingDates = new Set(
      existingAttendances.map((a: any) => a.date_str)
    );

    console.log(`\n📅 Existing attendance dates: ${existingAttendances.length} days`);

    // Find the first missing working day - use 2025-12-05 (Friday) which is missing
    let foundDate: Date | null = null;
    let dateStr: string = '';
    
    const missingDays = ['2025-12-05', '2025-12-12', '2025-12-19', '2025-12-26', '2025-12-31'];
    
    for (const missingDate of missingDays) {
      if (!existingDates.has(missingDate)) {
        const [y, m, d] = missingDate.split('-').map(Number);
        foundDate = new Date(y, m - 1, d); // month is 0-indexed
        dateStr = missingDate;
        break;
      }
    }

    if (!foundDate) {
      console.log('❌ No available date found to add attendance.');
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }
    console.log(`\n📅 Adding attendance for: ${dateStr}`);

    // Set check-in time to 8:00 AM
    const checkIn = new Date(foundDate);
    checkIn.setHours(8, 0, 0, 0);
    
    // Set check-out time to 5:00 PM (8 hours working + 1 hour lunch break)
    const checkOut = new Date(foundDate);
    checkOut.setHours(17, 0, 0, 0);

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
      [employee.id, dateStr, checkInStr, checkOutStr]
    );

    await queryRunner.release();
    await AppDataSource.destroy();

    console.log(`✅ Successfully added attendance for ${dateStr}`);
    console.log(`   Working Hours: 8.00 hours`);
    console.log(`\n✨ Migration completed successfully!`);
    console.log(`\n💡 Next step: Regenerate payroll to see updated calculations.`);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
addMissingDay();

