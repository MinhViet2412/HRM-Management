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
exports.WorkLocation = void 0;
const typeorm_1 = require("typeorm");
const employee_entity_1 = require("./employee.entity");
let WorkLocation = class WorkLocation {
};
exports.WorkLocation = WorkLocation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WorkLocation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], WorkLocation.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WorkLocation.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], WorkLocation.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 7 }),
    __metadata("design:type", Number)
], WorkLocation.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('int', { default: 100 }),
    __metadata("design:type", Number)
], WorkLocation.prototype, "radius", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WorkLocation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WorkLocation.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => employee_entity_1.Employee, (employee) => employee.workLocation),
    __metadata("design:type", Array)
], WorkLocation.prototype, "employees", void 0);
exports.WorkLocation = WorkLocation = __decorate([
    (0, typeorm_1.Entity)('work_locations')
], WorkLocation);
//# sourceMappingURL=work-location.entity.js.map