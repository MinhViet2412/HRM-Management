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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const department_entity_1 = require("../entities/department.entity");
let DepartmentSeeder = class DepartmentSeeder {
    constructor(departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    async run() {
        const departments = [
            {
                code: 'IT',
                name: 'Information Technology',
                description: 'IT Department',
            },
            {
                code: 'HR',
                name: 'Human Resources',
                description: 'HR Department',
            },
            {
                code: 'FIN',
                name: 'Finance',
                description: 'Finance Department',
            },
            {
                code: 'MKT',
                name: 'Marketing',
                description: 'Marketing Department',
            },
            {
                code: 'OPS',
                name: 'Operations',
                description: 'Operations Department',
            },
        ];
        for (const deptData of departments) {
            const existingDept = await this.departmentRepository.findOne({
                where: { code: deptData.code },
            });
            if (!existingDept) {
                const department = this.departmentRepository.create(deptData);
                await this.departmentRepository.save(department);
                console.log(`Created department: ${deptData.name}`);
            }
            else {
                console.log(`Department already exists: ${deptData.name}`);
            }
        }
    }
};
exports.DepartmentSeeder = DepartmentSeeder;
exports.DepartmentSeeder = DepartmentSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepartmentSeeder);
//# sourceMappingURL=department.seeder.js.map