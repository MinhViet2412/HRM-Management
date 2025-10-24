"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackfillPositionDepartments1710000000001 = void 0;
class BackfillPositionDepartments1710000000001 {
    constructor() {
        this.name = 'BackfillPositionDepartments1710000000001';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      UPDATE positions SET "departmentId" = d.id
      FROM departments d
      WHERE (
        (positions.title ILIKE '%Developer%' OR positions.code ILIKE '%DEV%') AND d.name = 'Information Technology'
      ) OR (
        (positions.title ILIKE '%HR%' OR positions.code ILIKE '%HR%') AND d.name = 'Human Resources'
      ) OR (
        (positions.title ILIKE '%Accountant%' OR positions.code ILIKE '%ACC%') AND d.name = 'Finance'
      ) OR (
        (positions.title ILIKE '%Marketing%' OR positions.code ILIKE '%MKT%') AND d.name = 'Marketing'
      ) OR (
        positions.title ILIKE '%Manager%' AND d.name = 'Operations'
      );
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`UPDATE positions SET "departmentId" = NULL`);
    }
}
exports.BackfillPositionDepartments1710000000001 = BackfillPositionDepartments1710000000001;
//# sourceMappingURL=1710000000001-backfill-position-departments.js.map