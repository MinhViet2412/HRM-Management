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
exports.UserSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const role_entity_1 = require("../entities/role.entity");
let UserSeeder = class UserSeeder {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async run() {
        const adminRole = await this.roleRepository.findOne({
            where: { name: role_entity_1.RoleName.ADMIN },
        });
        if (!adminRole) {
            throw new Error('Admin role not found. Please run role seeder first.');
        }
        const existingAdmin = await this.userRepository.findOne({
            where: { email: 'admin@company.com' },
        });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const adminUser = this.userRepository.create({
                email: 'admin@company.com',
                password: hashedPassword,
                firstName: 'Admin',
                lastName: 'User',
                phone: '+1234567890',
                roleId: adminRole.id,
                status: user_entity_1.UserStatus.ACTIVE,
            });
            await this.userRepository.save(adminUser);
            console.log('Created admin user: admin@company.com');
        }
        else {
            console.log('Admin user already exists');
        }
    }
};
exports.UserSeeder = UserSeeder;
exports.UserSeeder = UserSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserSeeder);
//# sourceMappingURL=user.seeder.js.map