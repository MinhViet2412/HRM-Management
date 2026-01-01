export declare enum InsuranceType {
    SOCIAL = "social",
    HEALTH = "health",
    UNEMPLOYMENT = "unemployment"
}
export declare class InsuranceConfig {
    id: string;
    type: InsuranceType;
    insuranceRate: number;
    salaryType: string;
    employeeRate: number;
    employerRate: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
