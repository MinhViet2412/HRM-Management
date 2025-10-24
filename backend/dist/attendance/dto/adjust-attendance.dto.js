"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdjustAttendanceDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const attendance_entity_1 = require("../../database/entities/attendance.entity");
class AdjustAttendanceDto {
}
exports.AdjustAttendanceDto = AdjustAttendanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New check-in time', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdjustAttendanceDto.prototype, "checkIn", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New check-out time', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], AdjustAttendanceDto.prototype, "checkOut", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'New attendance status', enum: attendance_entity_1.AttendanceStatus, required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(attendance_entity_1.AttendanceStatus),
    __metadata("design:type", String)
], AdjustAttendanceDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reason for adjustment', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustAttendanceDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Additional notes', required: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdjustAttendanceDto.prototype, "notes", void 0);
//# sourceMappingURL=adjust-attendance.dto.js.map