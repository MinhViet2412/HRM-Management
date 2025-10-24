"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contract_entity_1 = require("../database/entities/contract.entity");
const contract_template_entity_1 = require("../database/entities/contract-template.entity");
const role_entity_1 = require("../database/entities/role.entity");
const employee_entity_1 = require("../database/entities/employee.entity");
const contract_types_service_1 = require("../contract-types/contract-types.service");
let ContractsService = class ContractsService {
    constructor(contractRepo, contractTemplateRepo, employeeRepo, contractTypesService) {
        this.contractRepo = contractRepo;
        this.contractTemplateRepo = contractTemplateRepo;
        this.employeeRepo = employeeRepo;
        this.contractTypesService = contractTypesService;
    }
    async createContract(dto) {
        const contract = this.contractRepo.create(dto);
        return this.contractRepo.save(contract);
    }
    async getContracts(currentUser) {
        if (currentUser?.role === role_entity_1.RoleName.ADMIN) {
            return this.contractRepo.find({ relations: ['type'] });
        }
        if (currentUser?.role === role_entity_1.RoleName.MANAGER && currentUser.departmentId) {
            const employees = await this.employeeRepo.find({ where: { departmentId: currentUser.departmentId } });
            const employeeIds = employees.map((e) => e.id);
            return this.contractRepo.find({ where: employeeIds.length ? employeeIds.map(id => ({ employeeId: id })) : {}, relations: ['type'] });
        }
        if (currentUser?.role === role_entity_1.RoleName.EMPLOYEE && currentUser.employeeId) {
            return this.contractRepo.find({ where: { employeeId: currentUser.employeeId }, relations: ['type'] });
        }
        return [];
    }
    async getContract(id, currentUser) {
        const contract = await this.contractRepo.findOne({ where: { id }, relations: ['type'] });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        if (currentUser?.role === role_entity_1.RoleName.ADMIN)
            return contract;
        if (currentUser?.role === role_entity_1.RoleName.EMPLOYEE && currentUser.employeeId === contract.employeeId)
            return contract;
        if (currentUser?.role === role_entity_1.RoleName.MANAGER && currentUser.departmentId) {
            const employee = await this.employeeRepo.findOne({ where: { id: contract.employeeId } });
            if (employee?.departmentId === currentUser.departmentId)
                return contract;
        }
        throw new common_1.ForbiddenException('Access denied');
    }
    async updateContract(id, dto) {
        await this.contractRepo.update(id, dto);
        return this.getContract(id);
    }
    async deleteContract(id) {
        await this.contractRepo.delete(id);
        return { success: true };
    }
    async approveContract(id) {
        const contract = await this.contractRepo.findOne({ where: { id } });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        contract.status = contract_entity_1.ContractStatus.ACTIVE;
        await this.contractRepo.save(contract);
        return contract;
    }
    async rejectContract(id, reason) {
        const contract = await this.contractRepo.findOne({ where: { id } });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        contract.status = contract_entity_1.ContractStatus.TERMINATED;
        if (reason) {
            contract.notes = contract.notes ? `${contract.notes}\n[REJECT]: ${reason}` : `[REJECT]: ${reason}`;
        }
        await this.contractRepo.save(contract);
        return contract;
    }
    async createTemplate(dto) {
        const entity = this.contractTemplateRepo.create(dto);
        return this.contractTemplateRepo.save(entity);
    }
    async getTemplates() {
        return this.contractTemplateRepo.find({ relations: ['type'] });
    }
    async updateTemplate(id, dto) {
        await this.contractTemplateRepo.update(id, dto);
        return this.contractTemplateRepo.findOne({ where: { id }, relations: ['type'] });
    }
    async deleteTemplate(id) {
        await this.contractTemplateRepo.delete(id);
        return { success: true };
    }
};
exports.ContractsService = ContractsService;
exports.ContractsService = ContractsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contract_entity_1.Contract)),
    __param(1, (0, typeorm_1.InjectRepository)(contract_template_entity_1.ContractTemplate)),
    __param(2, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        contract_types_service_1.ContractTypesService])
], ContractsService);
//# sourceMappingURL=contracts.service.js.map