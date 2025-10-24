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
exports.ResignationRequest = exports.ResignationStatus = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
const user_entity_1 = require("./user.entity");
var ResignationStatus;
(function (ResignationStatus) {
    ResignationStatus["PENDING"] = "pending";
    ResignationStatus["APPROVED"] = "approved";
    ResignationStatus["REJECTED"] = "rejected";
    ResignationStatus["PROCESSED"] = "processed";
})(ResignationStatus || (exports.ResignationStatus = ResignationStatus = {}));
let ResignationRequest = class ResignationRequest {
};
exports.ResignationRequest = ResignationRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ResignationRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => employee_entity_1.Employee),
    (0, typeorm_1.JoinColumn)({ name: 'employeeId' }),
    __metadata("design:type", employee_entity_1.Employee)
], ResignationRequest.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResignationRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'requestedById' }),
    __metadata("design:type", user_entity_1.User)
], ResignationRequest.prototype, "requestedBy", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ResignationRequest.prototype, "requestedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ResignationRequest.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ResignationRequest.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ResignationStatus,
        default: ResignationStatus.PENDING,
    }),
    __metadata("design:type", String)
], ResignationRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'approvedById' }),
    __metadata("design:type", user_entity_1.User)
], ResignationRequest.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ResignationRequest.prototype, "approvedById", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ResignationRequest.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ResignationRequest.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ResignationRequest.prototype, "updatedAt", void 0);
exports.ResignationRequest = ResignationRequest = __decorate([
    (0, typeorm_1.Entity)('resignation_requests')
], ResignationRequest);
//# sourceMappingURL=resignation-request.entity.js.map