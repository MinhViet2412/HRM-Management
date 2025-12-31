import { DataSource } from 'typeorm';
import { AppDataSource } from '../data-source';
import { PayrollService } from '../../payroll/payroll.service';
import { PayrollModule } from '../../payroll/payroll.module';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';

async function regeneratePayroll() {
  try {
    // Initialize NestJS application to get PayrollService
    const app = await NestFactory.createApplicationContext(AppModule);
    const payrollService = app.get(PayrollService);

    // Find employee EMP002
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
      await app.close();
      return;
    }

    const employee = employeeResult[0];
    console.log(`✅ Found employee: ${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`);
    console.log(`   Employee ID: ${employee.id}`);

    await queryRunner.release();

    // Generate payroll for period 2025-12
    const period = '2025-12';
    console.log(`\n🔄 Regenerating payroll for period: ${period}...`);

    const payrolls = await payrollService.generatePayroll(period, employee.id);

    if (payrolls.length > 0) {
      const payroll = payrolls[0];
      console.log(`\n✅ Payroll regenerated successfully!`);
      console.log(`\n📊 Payroll Details:`);
      console.log(`   Period: ${payroll.period}`);
      console.log(`   Basic Salary: ${Number(payroll.basicSalary || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Allowance: ${Number(payroll.allowance || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Overtime Pay: ${Number(payroll.overtimePay || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Bonus: ${Number(payroll.bonus || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Gross Salary: ${Number(payroll.grossSalary || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Social Insurance: ${Number(payroll.socialInsurance || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Health Insurance: ${Number(payroll.healthInsurance || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Unemployment Insurance: ${Number(payroll.unemploymentInsurance || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Tax: ${Number(payroll.tax || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Total Deductions: ${Number(payroll.totalDeductions || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Net Salary: ${Number(payroll.netSalary || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Working Days: ${payroll.workingDays} (Standard: ${payroll.workingDays}, Actual: ${payroll.actualWorkingDays})`);
      
      // Verify calculations
      console.log(`\n🔍 Verification:`);
      const expectedGross = 10000000;
      const expectedInsurance = 1050000;
      const expectedDeduction = 15400000; // 11M + 4.4M
      const expectedTaxableIncome = expectedGross - expectedInsurance - expectedDeduction;
      const expectedTax = 0; // Because taxable income is negative
      const expectedNetSalary = expectedGross - expectedInsurance - expectedTax;
      
      console.log(`   Expected Gross: ${expectedGross.toLocaleString('vi-VN')} VND`);
      console.log(`   Actual Gross: ${Number(payroll.grossSalary || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Match: ${Number(payroll.grossSalary || 0) === expectedGross ? '✅' : '❌'}`);
      
      console.log(`   Expected Insurance: ${expectedInsurance.toLocaleString('vi-VN')} VND`);
      const totalInsurance = Number(payroll.socialInsurance || 0) + Number(payroll.healthInsurance || 0) + Number(payroll.unemploymentInsurance || 0);
      console.log(`   Actual Insurance: ${totalInsurance.toLocaleString('vi-VN')} VND`);
      console.log(`   Match: ${totalInsurance === expectedInsurance ? '✅' : '❌'}`);
      
      console.log(`   Expected Taxable Income: ${expectedTaxableIncome.toLocaleString('vi-VN')} VND`);
      console.log(`   Expected Tax: ${expectedTax.toLocaleString('vi-VN')} VND`);
      console.log(`   Actual Tax: ${Number(payroll.tax || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Match: ${Number(payroll.tax || 0) === expectedTax ? '✅' : '❌'}`);
      
      console.log(`   Expected Net: ${expectedNetSalary.toLocaleString('vi-VN')} VND`);
      console.log(`   Actual Net: ${Number(payroll.netSalary || 0).toLocaleString('vi-VN')} VND`);
      console.log(`   Match: ${Number(payroll.netSalary || 0) === expectedNetSalary ? '✅' : '❌'}`);
    } else {
      console.log(`⚠️  No payroll generated.`);
    }

    await AppDataSource.destroy();
    await app.close();

    console.log('\n✨ Regeneration completed!');
  } catch (error) {
    console.error('❌ Error during regeneration:', error);
    process.exit(1);
  }
}

// Run the regeneration
regeneratePayroll();

