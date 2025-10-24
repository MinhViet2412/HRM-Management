import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthService {
    private userRepository;
    private roleRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            employee: any;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        status: import("../database/entities/user.entity").UserStatus;
        lastLoginAt: Date;
        refreshToken: string;
        refreshTokenExpiresAt: Date;
        createdAt: Date;
        updatedAt: Date;
        employee: import("../database/entities/employee.entity").Employee;
        role: Role;
        roleId: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(userId: string): Promise<void>;
    getCurrentUser(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import("../database/entities/role.entity").RoleName;
        employee: import("../database/entities/employee.entity").Employee;
        avatar: string;
    }>;
    resetPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
}
