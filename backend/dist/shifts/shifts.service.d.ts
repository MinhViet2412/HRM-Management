import { Repository } from 'typeorm';
import { Shift } from '../database/entities/shift.entity';
export declare class ShiftsService {
    private readonly shiftRepository;
    constructor(shiftRepository: Repository<Shift>);
    create(data: Partial<Shift>): Promise<Shift>;
    findAll(): Promise<Shift[]>;
    findOne(id: string): Promise<Shift>;
    update(id: string, data: Partial<Shift>): Promise<Shift>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
