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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const role_entity_1 = require("../database/entities/role.entity");
let UsersService = class UsersService {
    constructor(userRepository, roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }
    async findAll() {
        return this.userRepository.find({
            relations: ['role', 'employee'],
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            relations: ['role', 'employee'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
            relations: ['role', 'employee'],
        });
    }
    async getRoles() {
        return this.roleRepository.find();
    }
    async updateUserRole(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId }, relations: ['role'] });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let role = null;
        if (dto.roleId) {
            role = await this.roleRepository.findOne({ where: { id: dto.roleId } });
        }
        else if (dto.roleName) {
            role = await this.roleRepository.findOne({ where: { name: dto.roleName } });
        }
        if (!role)
            throw new common_1.BadRequestException('Invalid role');
        user.role = role;
        user.roleId = role.id;
        await this.userRepository.save(user);
        return this.findOne(user.id);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map