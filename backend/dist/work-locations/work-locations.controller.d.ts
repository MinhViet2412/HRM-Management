import { WorkLocationsService } from './work-locations.service';
export declare class WorkLocationsController {
    private readonly service;
    constructor(service: WorkLocationsService);
    create(body: {
        name: string;
        address?: string;
        latitude: number;
        longitude: number;
        radius: number;
    }): Promise<import("../database/entities/work-location.entity").WorkLocation>;
    findAll(): Promise<import("../database/entities/work-location.entity").WorkLocation[]>;
    findOne(id: string): Promise<import("../database/entities/work-location.entity").WorkLocation>;
    update(id: string, body: Partial<{
        name: string;
        address?: string;
        latitude: number;
        longitude: number;
        radius: number;
    }>): Promise<import("../database/entities/work-location.entity").WorkLocation>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
