"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../../app.module");
const role_seeder_1 = require("./role.seeder");
const user_seeder_1 = require("./user.seeder");
const department_seeder_1 = require("./department.seeder");
const position_seeder_1 = require("./position.seeder");
const employee_seeder_1 = require("./employee.seeder");
const contract_type_seeder_1 = require("./contract-type.seeder");
const contract_template_seeder_1 = require("./contract-template.seeder");
const attendance_seeder_1 = require("./attendance.seeder");
async function runSeeds() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    try {
        console.log('Starting database seeding...');
        await app.get(role_seeder_1.RoleSeeder).run();
        await app.get(user_seeder_1.UserSeeder).run();
        await app.get(department_seeder_1.DepartmentSeeder).run();
        await app.get(position_seeder_1.PositionSeeder).run();
        await app.get(employee_seeder_1.EmployeeSeeder).run();
        await app.get(contract_type_seeder_1.ContractTypeSeeder).run();
        await app.get(contract_template_seeder_1.ContractTemplateSeeder).run();
        await app.get(attendance_seeder_1.AttendanceSeeder).run();
        console.log('Database seeding completed successfully!');
    }
    catch (error) {
        console.error('Error during seeding:', error);
    }
    finally {
        await app.close();
    }
}
runSeeds();
//# sourceMappingURL=index.js.map