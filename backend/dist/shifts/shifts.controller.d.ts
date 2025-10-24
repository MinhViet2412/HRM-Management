import { ShiftsService } from './shifts.service';
export declare class ShiftsController {
    private readonly service;
    constructor(service: ShiftsService);
    create(body: {
        name: string;
        startTime: string;
        endTime: string;
    }): Promise<import("../database/entities/shift.entity").Shift>;
    findAll(): Promise<import("../database/entities/shift.entity").Shift[]>;
    findOne(id: string): Promise<import("../database/entities/shift.entity").Shift>;
    update(id: string, body: Partial<{
        name: string;
        startTime: string;
        endTime: string;
    }>): Promise<import("../database/entities/shift.entity").Shift>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
