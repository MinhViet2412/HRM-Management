import { PositionsService } from './positions.service';
export declare class PositionsController {
    private readonly positionsService;
    constructor(positionsService: PositionsService);
    create(createPositionDto: any): Promise<import("../database/entities/position.entity").Position>;
    findAll(): Promise<import("../database/entities/position.entity").Position[]>;
    findOne(id: string): Promise<import("../database/entities/position.entity").Position>;
    update(id: string, updatePositionDto: any): Promise<import("../database/entities/position.entity").Position>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
