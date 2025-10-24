import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
export declare class RoleSeeder {
    private roleRepository;
    constructor(roleRepository: Repository<Role>);
    run(): Promise<void>;
}
