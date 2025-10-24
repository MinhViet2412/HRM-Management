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
exports.Payslip = exports.PayslipStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
const payroll_entity_1 = require("./payroll.entity");
var PayslipStatus;
(function (PayslipStatus) {
    PayslipStatus["ISSUED"] = "issued";
    PayslipStatus["PAID"] = "paid";
    PayslipStatus["CANCELLED"] = "cancelled";
})(PayslipStatus || (exports.PayslipStatus = PayslipStatus = {}));
let Payslip = class Payslip {
};
exports.Payslip = Payslip;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Payslip.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Payslip.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 7 }),
    __metadata("design:type", String)
], Payslip.prototype, "period", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payslip.prototype, "payrollId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Payslip.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PayslipStatus,
        default: PayslipStatus.ISSUED,
    }),
    __metadata("design:type", String)
], Payslip.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payslip.prototype, "issuedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Payslip.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Payslip.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Payslip.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Payslip.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], Payslip.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payroll_entity_1.Payroll),
    (0, typeorm_1.JoinColumn)({ name: 'payrollId' }),
    __metadata("design:type", payroll_entity_1.Payroll)
], Payslip.prototype, "payroll", void 0);
exports.Payslip = Payslip = __decorate([
    (0, typeorm_1.Entity)('payslips'),
    (0, typeorm_1.Index)(['employeeId', 'period'], { unique: true })
], Payslip);
//# sourceMappingURL=payslip.entity.js.map