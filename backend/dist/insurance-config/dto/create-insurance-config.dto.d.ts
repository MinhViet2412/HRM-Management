import { InsuranceType } from '../../database/entities/insurance-config.entity';
export declare class CreateInsuranceConfigDto {
    type: InsuranceType;
    insuranceRate: number;
    salaryType: string;
    employeeRate?: number;
    employerRate?: number;
    isActive?: boolean;
}
