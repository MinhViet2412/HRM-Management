import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDepartmentToPosition1710000000000 implements MigrationInterface {
  name = 'AddDepartmentToPosition1710000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "positions" ADD COLUMN "departmentId" uuid NULL`);
    await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_positions_department" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_positions_department"`);
    await queryRunner.query(`ALTER TABLE "positions" DROP COLUMN "departmentId"`);
  }
}


