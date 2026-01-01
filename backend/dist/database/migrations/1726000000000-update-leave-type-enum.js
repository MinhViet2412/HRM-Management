"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLeaveTypeEnum1726000000000 = void 0;
class UpdateLeaveTypeEnum1726000000000 {
    async up(queryRunner) {
        const oldTypes = ['personal', 'paternity', 'emergency'];
        for (const oldType of oldTypes) {
            const count = await queryRunner.query(`SELECT COUNT(*) as count FROM leave_requests WHERE type = $1`, [oldType]);
            if (parseInt(count[0].count) > 0) {
                console.log(`⚠️  Found ${count[0].count} leave requests with type '${oldType}'. These will need to be updated manually.`);
            }
        }
        console.log('✅ Migration completed. Old enum values (personal, paternity, emergency) are deprecated but remain in database for backward compatibility.');
    }
    async down(queryRunner) {
        console.log('Note: Enum values remain in database. No revert needed.');
    }
}
exports.UpdateLeaveTypeEnum1726000000000 = UpdateLeaveTypeEnum1726000000000;
//# sourceMappingURL=1726000000000-update-leave-type-enum.js.map