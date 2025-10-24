import { PayslipsService } from './payslips.service';
export declare class PayslipsController {
    private readonly payslipsService;
    constructor(payslipsService: PayslipsService);
    list(period: string): Promise<import("../database/entities/payslip.entity").Payslip[]>;
    listMine(req: any, period: string): any[] | Promise<import("../database/entities/payslip.entity").Payslip[]>;
    get(id: string): Promise<import("../database/entities/payslip.entity").Payslip>;
    bulkCreate(period: string, employeeIds?: string[]): Promise<import("../database/entities/payslip.entity").Payslip[]>;
    remove(id: string): Promise<{
        deleted: boolean;
    }>;
    updateStatus(id: string, status: string): Promise<import("../database/entities/payslip.entity").Payslip>;
}
