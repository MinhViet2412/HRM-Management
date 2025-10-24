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
exports.PositionSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const position_entity_1 = require("../entities/position.entity");
let PositionSeeder = class PositionSeeder {
    constructor(positionRepository) {
        this.positionRepository = positionRepository;
    }
    async run() {
        const positions = [
            {
                code: 'DEV',
                title: 'Software Developer',
                description: 'Software Developer Position',
                minSalary: 50000,
                maxSalary: 80000,
            },
            {
                code: 'SENIOR_DEV',
                title: 'Senior Software Developer',
                description: 'Senior Software Developer Position',
                minSalary: 80000,
                maxSalary: 120000,
            },
            {
                code: 'MANAGER',
                title: 'Manager',
                description: 'Manager Position',
                minSalary: 70000,
                maxSalary: 100000,
            },
            {
                code: 'HR_SPECIALIST',
                title: 'HR Specialist',
                description: 'Human Resources Specialist',
                minSalary: 45000,
                maxSalary: 65000,
            },
            {
                code: 'ACCOUNTANT',
                title: 'Accountant',
                description: 'Accountant Position',
                minSalary: 40000,
                maxSalary: 60000,
            },
        ];
        for (const posData of positions) {
            const existingPos = await this.positionRepository.findOne({
                where: { code: posData.code },
            });
            if (!existingPos) {
                const position = this.positionRepository.create(posData);
                await this.positionRepository.save(position);
                console.log(`Created position: ${posData.title}`);
            }
            else {
                console.log(`Position already exists: ${posData.title}`);
            }
        }
    }
};
exports.PositionSeeder = PositionSeeder;
exports.PositionSeeder = PositionSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PositionSeeder);
//# sourceMappingURL=position.seeder.js.map