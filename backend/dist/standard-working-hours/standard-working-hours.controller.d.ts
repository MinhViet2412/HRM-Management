import { StandardWorkingHoursService } from './standard-working-hours.service';
import { CreateStandardWorkingHoursDto } from './dto/create-standard-working-hours.dto';
import { UpdateStandardWorkingHoursDto } from './dto/update-standard-working-hours.dto';
export declare class StandardWorkingHoursController {
    private readonly standardWorkingHoursService;
    constructor(standardWorkingHoursService: StandardWorkingHoursService);
    create(createDto: CreateStandardWorkingHoursDto): Promise<import("../database/entities/standard-working-hours.entity").StandardWorkingHours>;
    findAll(): Promise<import("../database/entities/standard-working-hours.entity").StandardWorkingHours[]>;
    getByPeriod(period: string): Promise<import("../database/entities/standard-working-hours.entity").StandardWorkingHours>;
    getOrCalculate(year: string, month: string): Promise<{
        hours: number;
        days: number;
    }>;
    findOne(id: string): Promise<import("../database/entities/standard-working-hours.entity").StandardWorkingHours>;
    update(id: string, updateDto: UpdateStandardWorkingHoursDto): Promise<import("../database/entities/standard-working-hours.entity").StandardWorkingHours>;
    remove(id: string): Promise<void>;
}
