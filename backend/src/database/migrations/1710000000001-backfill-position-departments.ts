import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillPositionDepartments1710000000001 implements MigrationInterface {
  name = 'BackfillPositionDepartments1710000000001'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Simple heuristic mapping by code/title keywords
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

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE positions SET "departmentId" = NULL`);
  }
}


