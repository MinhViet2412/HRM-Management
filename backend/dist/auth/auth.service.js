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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../database/entities/user.entity");
const role_entity_1 = require("../database/entities/role.entity");
let AuthService = class AuthService {
    constructor(userRepository, roleRepository, jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['role', 'employee'],
        });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status !== 'active') {
            throw new common_1.UnauthorizedException('Account is not active');
        }
        const payload = {
            email: user.email,
            sub: user.id,
            role: user.role.name,
            employeeId: user.employee?.id,
        };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        await this.userRepository.update(user.id, {
            lastLoginAt: new Date(),
            refreshToken,
            refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role.name,
                employee: user.employee,
            },
        };
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const role = await this.roleRepository.findOne({
            where: { name: registerDto.role },
        });
        if (!role) {
            throw new common_1.BadRequestException('Invalid role');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = this.userRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            roleId: role.id,
        });
        const savedUser = await this.userRepository.save(user);
        const { password, ...result } = savedUser;
        return result;
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
                relations: ['role', 'employee'],
            });
            if (!user || user.refreshToken !== refreshToken) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            if (user.refreshTokenExpiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Refresh token expired');
            }
            const newPayload = {
                email: user.email,
                sub: user.id,
                role: user.role.name,
                employeeId: user.employee?.id,
            };
            const accessToken = this.jwtService.sign(newPayload);
            return { accessToken };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async logout(userId) {
        await this.userRepository.update(userId, {
            refreshToken: null,
            refreshTokenExpiresAt: null,
        });
    }
    async getCurrentUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['role', 'employee'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role.name,
            employee: user.employee,
            avatar: user.employee?.avatar,
        };
    }
    async resetPassword(dto) {
        const user = await this.userRepository.findOne({ where: { email: dto.email } });
        if (!user) {
            throw new common_1.BadRequestException('User with this email does not exist');
        }
        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
        user.password = hashedPassword;
        await this.userRepository.save(user);
        return { message: 'Password updated successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map