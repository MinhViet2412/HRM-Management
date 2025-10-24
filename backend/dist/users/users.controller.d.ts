import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("../database/entities/user.entity").User[]>;
    findOne(id: string): Promise<import("../database/entities/user.entity").User>;
    getRoles(): Promise<import("../database/entities/role.entity").Role[]>;
    updateRole(id: string, dto: UpdateUserRoleDto): Promise<import("../database/entities/user.entity").User>;
}
