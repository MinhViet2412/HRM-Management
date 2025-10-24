import { RoleName } from '../../database/entities/role.entity';
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: RoleName;
}
