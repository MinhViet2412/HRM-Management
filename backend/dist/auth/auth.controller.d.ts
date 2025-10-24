import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
        role: import("../database/entities/role.entity").Role;
        roleId: string;
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    getCurrentUser(req: any): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string;
        role: import("../database/entities/role.entity").RoleName;
        employee: import("../database/entities/employee.entity").Employee;
        avatar: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
}
