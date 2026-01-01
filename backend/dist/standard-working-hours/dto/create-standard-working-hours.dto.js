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
exports.CreateStandardWorkingHoursDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateStandardWorkingHoursDto {
}
exports.CreateStandardWorkingHoursDto = CreateStandardWorkingHoursDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2025, description: 'Năm' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(2000),
    (0, class_validator_1.Max)(2100),
    __metadata("design:type", Number)
], CreateStandardWorkingHoursDto.prototype, "year", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 12, description: 'Tháng (1-12)' }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(12),
    __metadata("design:type", Number)
], CreateStandardWorkingHoursDto.prototype, "month", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 184, description: 'Số giờ công chuẩn trong tháng' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateStandardWorkingHoursDto.prototype, "standardHours", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 23, description: 'Số ngày công chuẩn trong tháng' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateStandardWorkingHoursDto.prototype, "standardDays", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ required: false, description: 'Mô tả' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateStandardWorkingHoursDto.prototype, "description", void 0);
//# sourceMappingURL=create-standard-working-hours.dto.js.map