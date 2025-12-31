import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';

async function checkAttendanceCount() {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

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

    const year = 2025;
    const month = 12;

    // Get all attendance records for December 2025
    const attendances = await queryRunner.query(
      `SELECT date::text as date_str, "workingHours"::numeric as hours FROM attendances WHERE "employeeId" = $1 AND date >= $2::date AND date < $3::date ORDER BY date`,
      [employee.id, `${year}-${String(month).padStart(2, '0')}-01`, `2026-01-01`]
    );

    const totalHours = attendances.reduce((sum: number, a: any) => sum + Number(a.hours || 0), 0);
    const totalDays = attendances.length;

    console.log(`\n📊 Attendance Summary for December 2025:`);
    console.log(`   Total Days: ${totalDays} days`);
    console.log(`   Total Hours: ${totalHours} hours`);
    
    // Expected: 23 days, 184 hours
    const expectedDays = 23;
    const expectedHours = 184;
    
    console.log(`\n📋 Expected:`);
    console.log(`   Days: ${expectedDays} days`);
    console.log(`   Hours: ${expectedHours} hours`);
    
    console.log(`\n🔍 Comparison:`);
    if (totalDays === expectedDays) {
      console.log(`   ✅ Days: Correct (${totalDays} days)`);
    } else if (totalDays > expectedDays) {
      console.log(`   ❌ Days: Dư ${totalDays - expectedDays} ngày (${totalDays} > ${expectedDays})`);
    } else {
      console.log(`   ❌ Days: Thiếu ${expectedDays - totalDays} ngày (${totalDays} < ${expectedDays})`);
    }
    
    if (totalHours === expectedHours) {
      console.log(`   ✅ Hours: Correct (${totalHours} hours)`);
    } else if (totalHours > expectedHours) {
      console.log(`   ❌ Hours: Dư ${totalHours - expectedHours} giờ (${totalHours} > ${expectedHours})`);
    } else {
      console.log(`   ❌ Hours: Thiếu ${expectedHours - totalHours} giờ (${totalHours} < ${expectedHours})`);
    }

    if (totalDays > expectedDays) {
      console.log(`\n📅 All attendance dates:`);
      attendances.forEach((a: any, index: number) => {
        console.log(`   ${index + 1}. ${a.date_str} - ${a.hours} hours`);
      });
      
      console.log(`\n💡 Need to remove ${totalDays - expectedDays} day(s) to match expected 23 days.`);
    }

    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAttendanceCount();

