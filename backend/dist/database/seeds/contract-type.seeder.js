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
exports.ContractTypeSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const contract_type_entity_1 = require("../entities/contract-type.entity");
let ContractTypeSeeder = class ContractTypeSeeder {
    constructor(repo) {
        this.repo = repo;
    }
    async run() {
        console.log('ContractTypeSeeder: Starting...');
        const defaults = [
            {
                name: 'Chính thức',
                description: 'Hợp đồng lao động chính thức không xác định thời hạn',
                standardTermMonths: null,
                probationMonths: 0
            },
            {
                name: 'Thử việc',
                description: 'Hợp đồng thử việc',
                standardTermMonths: 2,
                probationMonths: 0
            },
            {
                name: 'Không thời hạn',
                description: 'Hợp đồng lao động không xác định thời hạn',
                standardTermMonths: null,
                probationMonths: 2
            },
            {
                name: 'Xác định thời hạn 12 tháng',
                description: 'Hợp đồng 12 tháng',
                standardTermMonths: 12,
                probationMonths: 2
            },
            {
                name: 'Xác định thời hạn 24 tháng',
                description: 'Hợp đồng 24 tháng',
                standardTermMonths: 24,
                probationMonths: 2
            },
        ];
        console.log(`ContractTypeSeeder: Processing ${defaults.length} contract types...`);
        for (const def of defaults) {
            console.log(`ContractTypeSeeder: Checking ${def.name}...`);
            const exists = await this.repo.findOne({ where: { name: def.name } });
            if (!exists) {
                console.log(`ContractTypeSeeder: Creating ${def.name}...`);
                await this.repo.save(this.repo.create(def));
                console.log(`Created contract type: ${def.name}`);
            }
            else {
                console.log(`Contract type already exists: ${def.name}`);
            }
        }
        console.log('ContractTypeSeeder: Completed!');
    }
};
exports.ContractTypeSeeder = ContractTypeSeeder;
exports.ContractTypeSeeder = ContractTypeSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(contract_type_entity_1.ContractType)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ContractTypeSeeder);
//# sourceMappingURL=contract-type.seeder.js.map