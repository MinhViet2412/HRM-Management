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
exports.RoleSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const role_entity_1 = require("../entities/role.entity");
let RoleSeeder = class RoleSeeder {
    constructor(roleRepository) {
        this.roleRepository = roleRepository;
    }
    async run() {
        const roles = [
            {
                name: role_entity_1.RoleName.ADMIN,
                description: 'System Administrator',
                permissions: ['*'],
            },
            {
                name: role_entity_1.RoleName.HR,
                description: 'Human Resources',
                permissions: [
                    'employees:read',
                    'employees:write',
                    'attendance:read',
                    'attendance:write',
                    'leave:read',
                    'leave:write',
                    'payroll:read',
                    'payroll:write',
                    'reports:read',
                ],
            },
            {
                name: role_entity_1.RoleName.MANAGER,
                description: 'Department Manager',
                permissions: [
                    'employees:read',
                    'attendance:read',
                    'attendance:write',
                    'leave:read',
                    'leave:write',
                    'reports:read',
                ],
            },
            {
                name: role_entity_1.RoleName.EMPLOYEE,
                description: 'Employee',
                permissions: [
                    'attendance:read',
                    'attendance:write',
                    'leave:read',
                    'leave:write',
                ],
            },
        ];
        for (const roleData of roles) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: roleData.name },
            });
            if (!existingRole) {
                const role = this.roleRepository.create(roleData);
                await this.roleRepository.save(role);
                console.log(`Created role: ${roleData.name}`);
            }
            else {
                console.log(`Role already exists: ${roleData.name}`);
            }
        }
    }
};
exports.RoleSeeder = RoleSeeder;
exports.RoleSeeder = RoleSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RoleSeeder);
//# sourceMappingURL=role.seeder.js.map