import { ResignationsService } from './resignations.service';
export declare class ResignationsProcessor {
    private readonly service;
    private readonly logger;
    constructor(service: ResignationsService);
    handleCron(): Promise<void>;
}
