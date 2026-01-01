import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLeaveTypeEnum1726000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if there are any leave requests with old types
    const oldTypes = ['personal', 'paternity', 'emergency'];
    
    for (const oldType of oldTypes) {
      const count = await queryRunner.query(
        `SELECT COUNT(*) as count FROM leave_requests WHERE type = $1`,
        [oldType]
      );
      
      if (parseInt(count[0].count) > 0) {
        console.log(`⚠️  Found ${count[0].count} leave requests with type '${oldType}'. These will need to be updated manually.`);
      }
    }

    // Note: PostgreSQL doesn't allow removing enum values directly
    // The enum values will remain in the database but won't be used in new records
    // Application-level validation will prevent using old types
    
    console.log('✅ Migration completed. Old enum values (personal, paternity, emergency) are deprecated but remain in database for backward compatibility.');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to revert - enum values remain in database
    console.log('Note: Enum values remain in database. No revert needed.');
  }
}

