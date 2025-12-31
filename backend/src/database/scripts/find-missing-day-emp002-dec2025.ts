import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function findMissingDay() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    const employeeResult = await queryRunner.query(
      `SELECT id FROM employees WHERE "employeeCode" = 'EMP002' LIMIT 1`
    );

    if (employeeResult.length === 0) {
      console.log('❌ Employee EMP002 not found.');
      await queryRunner.release();
      await AppDataSource.destroy();
      return;
    }

    const employeeId = employeeResult[0].id;
    const year = 2025;
    const month = 12;

    // Get all existing attendance dates
    const existingAttendances = await queryRunner.query(
      `SELECT date::text as date_str FROM attendances WHERE "employeeId" = $1 AND date >= $2::date AND date < $3::date ORDER BY date`,
      [employeeId, `${year}-${String(month).padStart(2, '0')}-01`, `2026-01-01`]
    );

    const existingDates = new Set(
      existingAttendances.map((a: any) => a.date_str)
    );

    console.log(`📅 Existing attendance dates: ${existingAttendances.length} days`);
    existingAttendances.forEach((a: any) => {
      console.log(`   - ${a.date_str}`);
    });

    // Find all working days in December 2025
    const daysInMonth = new Date(year, month, 0).getDate();
    const workingDays: string[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        workingDays.push(dateStr);
      }
    }

    console.log(`\n📅 Total working days in December 2025: ${workingDays.length} days`);
    
    // Find missing days
    const missingDays = workingDays.filter(date => !existingDates.has(date));
    
    console.log(`\n❌ Missing days: ${missingDays.length}`);
    if (missingDays.length > 0) {
      missingDays.forEach(date => {
        console.log(`   - ${date}`);
      });
    } else {
      console.log(`   All working days have attendance records.`);
    }

    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findMissingDay();

