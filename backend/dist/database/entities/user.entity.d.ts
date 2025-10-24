import { Employee } from './employee.entity';
import { Role } from './role.entity';
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: UserStatus;
    lastLoginAt: Date;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    employee: Employee;
    role: Role;
    roleId: string;
}
