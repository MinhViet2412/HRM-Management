"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
async function checkPM0002Dependents() {
    try {
        if (!data_source_1.AppDataSource.isInitialized) {
            await data_source_1.AppDataSource.initialize();
        }
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        const employeeCode = 'EMP002';
        const employeeResult = await queryRunner.query(`SELECT id, "employeeCode", "firstName", "lastName" FROM employees WHERE "employeeCode" = $1 LIMIT 1`, [employeeCode]);
        if (employeeResult.length === 0) {
            console.log(`❌ Employee ${employeeCode} not found.`);
            console.log('📋 Available employee codes:');
            const allEmployees = await queryRunner.query(`SELECT "employeeCode", "firstName", "lastName" FROM employees LIMIT 10`);
            allEmployees.forEach((emp) => {
                console.log(`   - ${emp.employeeCode}: ${emp.firstName} ${emp.lastName}`);
            });
            await queryRunner.release();
            await data_source_1.AppDataSource.destroy();
            return;
        }
        const employee = employeeResult[0];
        console.log(`✅ Found employee: ${employee.employeeCode} - ${employee.firstName} ${employee.lastName}`);
        console.log(`   Employee ID: ${employee.id}`);
        const dependentsResult = await queryRunner.query(`SELECT id, "fullName", "isActive", "deductionAmount", relationship FROM dependents WHERE "employeeId" = $1`, [employee.id]);
        console.log(`\n📋 Dependents for ${employee.employeeCode}:`);
        if (dependentsResult.length === 0) {
            console.log('   ⚠️  No dependents found!');
        }
        else {
            dependentsResult.forEach((dep, index) => {
                console.log(`   ${index + 1}. ${dep.fullName}`);
                console.log(`      - Relationship: ${dep.relationship}`);
                console.log(`      - Is Active: ${dep.isActive ? '✅ Yes' : '❌ No'}`);
                console.log(`      - Deduction Amount: ${Number(dep.deductionAmount || 0).toLocaleString('vi-VN')} VND`);
            });
        }
        const activeCountResult = await queryRunner.query(`SELECT COUNT(*) as count FROM dependents WHERE "employeeId" = $1 AND "isActive" = true`, [employee.id]);
        const activeCount = parseInt(activeCountResult[0].count);
        console.log(`\n📊 Active Dependents Count: ${activeCount}`);
        const payrollResult = await queryRunner.query(`SELECT period, tax, "grossSalary", "totalDeductions" FROM payrolls WHERE "employeeId" = $1 ORDER BY period DESC LIMIT 5`, [employee.id]);
        console.log(`\n💰 Recent Payroll Records:`);
        if (payrollResult.length === 0) {
            console.log('   ⚠️  No payroll records found!');
        }
        else {
            payrollResult.forEach((payroll) => {
                console.log(`   - Period: ${payroll.period}`);
                console.log(`     Gross Salary: ${Number(payroll.grossSalary || 0).toLocaleString('vi-VN')} VND`);
                console.log(`     Tax: ${Number(payroll.tax || 0).toLocaleString('vi-VN')} VND`);
                console.log(`     Total Deductions: ${Number(payroll.totalDeductions || 0).toLocaleString('vi-VN')} VND`);
            });
        }
        const taxConfigResult = await queryRunner.query(`SELECT "dependentDeductionAmount" FROM tax_config WHERE key = 'dependent_deduction_amount' LIMIT 1`);
        if (taxConfigResult.length > 0) {
            console.log(`\n⚙️  Tax Config - Dependent Deduction Amount: ${Number(taxConfigResult[0].dependentDeductionAmount || 0).toLocaleString('vi-VN')} VND`);
        }
        await queryRunner.release();
        await data_source_1.AppDataSource.destroy();
        console.log('\n✨ Check completed!');
    }
    catch (error) {
        console.error('❌ Error during check:', error);
        process.exit(1);
    }
}
checkPM0002Dependents();
//# sourceMappingURL=check-pm0002-dependents.js.map