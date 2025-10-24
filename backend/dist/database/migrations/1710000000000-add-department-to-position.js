"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddDepartmentToPosition1710000000000 = void 0;
class AddDepartmentToPosition1710000000000 {
    constructor() {
        this.name = 'AddDepartmentToPosition1710000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "positions" ADD COLUMN "departmentId" uuid NULL`);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_positions_department" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_positions_department"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "departmentId"`);
    }
}
exports.AddDepartmentToPosition1710000000000 = AddDepartmentToPosition1710000000000;
//# sourceMappingURL=1710000000000-add-department-to-position.js.map