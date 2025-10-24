import { Repository } from 'typeorm';
import { Position } from '../database/entities/position.entity';
export declare class PositionsService {
    private positionRepository;
    constructor(positionRepository: Repository<Position>);
    create(createPositionDto: any): Promise<Position>;
    findAll(): Promise<Position[]>;
    findOne(id: string): Promise<Position>;
    update(id: string, updatePositionDto: any): Promise<Position>;
    remove(id: string): Promise<void>;
}
