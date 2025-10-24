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
exports.OvertimeRequest = exports.OvertimeStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
var OvertimeStatus;
(function (OvertimeStatus) {
    OvertimeStatus["PENDING"] = "pending";
    OvertimeStatus["APPROVED"] = "approved";
    OvertimeStatus["REJECTED"] = "rejected";
})(OvertimeStatus || (exports.OvertimeStatus = OvertimeStatus = {}));
let OvertimeRequest = class OvertimeRequest {
};
exports.OvertimeRequest = OvertimeRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee, (employee) => employee.id),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], OvertimeRequest.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], OvertimeRequest.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "endTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], OvertimeRequest.prototype, "hours", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: OvertimeStatus,
        default: OvertimeStatus.PENDING,
    }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "approverId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], OvertimeRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], OvertimeRequest.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], OvertimeRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], OvertimeRequest.prototype, "updatedAt", void 0);
exports.OvertimeRequest = OvertimeRequest = __decorate([
    (0, typeorm_1.Entity)('overtime_requests')
], OvertimeRequest);
//# sourceMappingURL=overtime-request.entity.js.map