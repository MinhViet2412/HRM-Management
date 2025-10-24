import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
export declare class UsersService {
    private userRepository;
    private roleRepository;
    constructor(userRepository: Repository<User>, roleRepository: Repository<Role>);
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    getRoles(): Promise<Role[]>;
    updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<User>;
}
