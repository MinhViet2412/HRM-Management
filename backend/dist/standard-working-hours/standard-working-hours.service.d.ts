import { Repository } from 'typeorm';
import { StandardWorkingHours } from '../database/entities/standard-working-hours.entity';
import { CreateStandardWorkingHoursDto } from './dto/create-standard-working-hours.dto';
import { UpdateStandardWorkingHoursDto } from './dto/update-standard-working-hours.dto';
export declare class StandardWorkingHoursService {
    private standardWorkingHoursRepository;
    constructor(standardWorkingHoursRepository: Repository<StandardWorkingHours>);
    create(createDto: CreateStandardWorkingHoursDto): Promise<StandardWorkingHours>;
    findAll(): Promise<StandardWorkingHours[]>;
    findByYearMonth(year: number, month: number): Promise<StandardWorkingHours | null>;
    findOne(id: string): Promise<StandardWorkingHours>;
    update(id: string, updateDto: UpdateStandardWorkingHoursDto): Promise<StandardWorkingHours>;
    remove(id: string): Promise<void>;
    getByPeriod(period: string): Promise<StandardWorkingHours | null>;
    getOrCalculate(year: number, month: number): Promise<{
        hours: number;
        days: number;
    }>;
}
