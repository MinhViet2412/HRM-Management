import { Repository } from 'typeorm';
import { LeaveLimitConfig } from '../database/entities/leave-limit-config.entity';
import { LeaveType } from '../database/entities/leave-request.entity';
import { CreateLeaveLimitConfigDto } from './dto/create-leave-limit-config.dto';
import { UpdateLeaveLimitConfigDto } from './dto/update-leave-limit-config.dto';
export declare class LeaveLimitConfigService {
    private leaveLimitConfigRepository;
    constructor(leaveLimitConfigRepository: Repository<LeaveLimitConfig>);
    create(createDto: CreateLeaveLimitConfigDto): Promise<LeaveLimitConfig>;
    findAll(): Promise<LeaveLimitConfig[]>;
    findByYear(year: number): Promise<LeaveLimitConfig[]>;
    findByTypeAndYear(leaveType: LeaveType, year: number): Promise<LeaveLimitConfig | null>;
    findOne(id: string): Promise<LeaveLimitConfig>;
    update(id: string, updateDto: UpdateLeaveLimitConfigDto): Promise<LeaveLimitConfig>;
    remove(id: string): Promise<void>;
    getMaxDays(leaveType: LeaveType, year: number): Promise<number | null>;
}
