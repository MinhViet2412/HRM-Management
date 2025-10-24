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
exports.ContractTemplateSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contract_template_entity_1 = require("../entities/contract-template.entity");
const contract_type_entity_1 = require("../entities/contract-type.entity");
let ContractTemplateSeeder = class ContractTemplateSeeder {
    constructor(templateRepo, typeRepo) {
        this.templateRepo = templateRepo;
        this.typeRepo = typeRepo;
    }
    async run() {
        const defaultTemplates = [
            {
                name: 'Mẫu HĐLĐ cơ bản',
                content: 'HỢP ĐỒNG LAO ĐỘNG\n\nBên A: {{companyName}}\nBên B: {{employeeFullName}}\nChức danh: {{position}}\nMức lương cơ bản: {{baseSalary}}\nPhụ cấp: {{allowance}}\nThưởng: {{bonus}}\nThời hạn: {{termMonths}} tháng\nNgày bắt đầu: {{startDate}}\nNgày kết thúc: {{endDate}}',
            },
        ];
        for (const t of defaultTemplates) {
            const exists = await this.templateRepo.findOne({ where: { name: t.name } });
            if (!exists) {
                await this.templateRepo.save(this.templateRepo.create(t));
                console.log(`Created contract template: ${t.name}`);
            }
        }
    }
};
exports.ContractTemplateSeeder = ContractTemplateSeeder;
exports.ContractTemplateSeeder = ContractTemplateSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contract_template_entity_1.ContractTemplate)),
    __param(1, (0, typeorm_1.InjectRepository)(contract_type_entity_1.ContractType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ContractTemplateSeeder);
//# sourceMappingURL=contract-template.seeder.js.map