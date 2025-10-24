import { User } from './user.entity';
export declare enum RoleName {
    ADMIN = "admin",
    HR = "hr",
    MANAGER = "manager",
    EMPLOYEE = "employee"
}
export declare class Role {
    id: string;
    name: RoleName;
    description: string;
    permissions: string[];
    createdAt: Date;
    updatedAt: Date;
    users: User[];
}
