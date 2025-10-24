import { Repository } from 'typeorm';
import { WorkLocation } from '../database/entities/work-location.entity';
export declare class WorkLocationsService {
    private workLocationRepository;
    constructor(workLocationRepository: Repository<WorkLocation>);
    create(data: Partial<WorkLocation>): Promise<WorkLocation>;
    findAll(): Promise<WorkLocation[]>;
    findOne(id: string): Promise<WorkLocation>;
    update(id: string, data: Partial<WorkLocation>): Promise<WorkLocation>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
