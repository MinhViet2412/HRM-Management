import { LeaveLimitConfigService } from './leave-limit-config.service';
import { CreateLeaveLimitConfigDto } from './dto/create-leave-limit-config.dto';
import { UpdateLeaveLimitConfigDto } from './dto/update-leave-limit-config.dto';
export declare class LeaveLimitConfigController {
    private readonly leaveLimitConfigService;
    constructor(leaveLimitConfigService: LeaveLimitConfigService);
    create(createDto: CreateLeaveLimitConfigDto): Promise<import("../database/entities/leave-limit-config.entity").LeaveLimitConfig>;
    findAll(year?: string): Promise<import("../database/entities/leave-limit-config.entity").LeaveLimitConfig[]>;
    findOne(id: string): Promise<import("../database/entities/leave-limit-config.entity").LeaveLimitConfig>;
    update(id: string, updateDto: UpdateLeaveLimitConfigDto): Promise<import("../database/entities/leave-limit-config.entity").LeaveLimitConfig>;
    remove(id: string): Promise<void>;
}
