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
exports.EmployeeSeeder = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../entities/employee.entity");
const department_entity_1 = require("../entities/department.entity");
const position_entity_1 = require("../entities/position.entity");
let EmployeeSeeder = class EmployeeSeeder {
    constructor(employeeRepository, departmentRepository, positionRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
    }
    async run() {
        const itDept = await this.departmentRepository.findOne({
            where: { code: 'IT' },
        });
        const hrDept = await this.departmentRepository.findOne({
            where: { code: 'HR' },
        });
        const devPos = await this.positionRepository.findOne({
            where: { code: 'DEV' },
        });
        const hrPos = await this.positionRepository.findOne({
            where: { code: 'HR_SPECIALIST' },
        });
        if (!itDept || !hrDept || !devPos || !hrPos) {
            throw new Error('Required departments or positions not found. Please run department and position seeders first.');
        }
        const employees = [
            {
                employeeCode: 'EMP001',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@company.com',
                phone: '+1234567891',
                dateOfBirth: new Date('1990-01-15'),
                gender: employee_entity_1.Gender.MALE,
                basicSalary: 60000,
                allowance: 5000,
                hireDate: new Date('2023-01-01'),
                departmentId: itDept.id,
                positionId: devPos.id,
            },
            {
                employeeCode: 'EMP002',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@company.com',
                phone: '+1234567892',
                dateOfBirth: new Date('1988-05-20'),
                gender: employee_entity_1.Gender.FEMALE,
                basicSalary: 55000,
                allowance: 4000,
                hireDate: new Date('2023-02-01'),
                departmentId: hrDept.id,
                positionId: hrPos.id,
            },
            {
                employeeCode: 'EMP003',
                firstName: 'Mike',
                lastName: 'Johnson',
                email: 'mike.johnson@company.com',
                phone: '+1234567893',
                dateOfBirth: new Date('1992-08-10'),
                gender: employee_entity_1.Gender.MALE,
                basicSalary: 65000,
                allowance: 6000,
                hireDate: new Date('2023-03-01'),
                departmentId: itDept.id,
                positionId: devPos.id,
            },
            {
                employeeCode: 'EMP004',
                firstName: 'Sarah',
                lastName: 'Wilson',
                email: 'sarah.wilson@company.com',
                phone: '+1234567894',
                dateOfBirth: new Date('1991-12-05'),
                gender: employee_entity_1.Gender.FEMALE,
                basicSalary: 58000,
                allowance: 4500,
                hireDate: new Date('2023-04-01'),
                departmentId: hrDept.id,
                positionId: hrPos.id,
            },
            {
                employeeCode: 'EMP005',
                firstName: 'David',
                lastName: 'Brown',
                email: 'david.brown@company.com',
                phone: '+1234567895',
                dateOfBirth: new Date('1989-07-25'),
                gender: employee_entity_1.Gender.MALE,
                basicSalary: 62000,
                allowance: 5500,
                hireDate: new Date('2023-05-01'),
                departmentId: itDept.id,
                positionId: devPos.id,
            },
        ];
        for (const empData of employees) {
            const existingEmp = await this.employeeRepository.findOne({
                where: { employeeCode: empData.employeeCode },
            });
            if (!existingEmp) {
                const employee = this.employeeRepository.create(empData);
                await this.employeeRepository.save(employee);
                console.log(`Created employee: ${empData.firstName} ${empData.lastName}`);
            }
            else {
                console.log(`Employee already exists: ${empData.firstName} ${empData.lastName}`);
            }
        }
    }
};
exports.EmployeeSeeder = EmployeeSeeder;
exports.EmployeeSeeder = EmployeeSeeder = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeeSeeder);
//# sourceMappingURL=employee.seeder.js.map