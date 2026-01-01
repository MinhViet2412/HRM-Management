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
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const employee_entity_1 = require("../database/entities/employee.entity");
const department_entity_1 = require("../database/entities/department.entity");
const position_entity_1 = require("../database/entities/position.entity");
const user_entity_1 = require("../database/entities/user.entity");
const role_entity_1 = require("../database/entities/role.entity");
const work_location_entity_1 = require("../database/entities/work-location.entity");
const shift_entity_1 = require("../database/entities/shift.entity");
let EmployeesService = class EmployeesService {
    constructor(employeeRepository, departmentRepository, positionRepository, userRepository, roleRepository, workLocationRepository, shiftRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.workLocationRepository = workLocationRepository;
        this.shiftRepository = shiftRepository;
    }
    async generateEmployeeCode() {
        const employees = await this.employeeRepository
            .createQueryBuilder('employee')
            .select('employee.employeeCode')
            .where('employee.employeeCode LIKE :prefix', { prefix: 'EMP%' })
            .getMany();
        if (employees.length === 0) {
            return 'EMP0001';
        }
        let maxNumber = 0;
        employees.forEach(emp => {
            const match = emp.employeeCode.match(/^EMP(\d+)$/);
            if (match) {
                const number = parseInt(match[1], 10);
                maxNumber = Math.max(maxNumber, number);
            }
        });
        const nextNumber = maxNumber + 1;
        return `EMP${nextNumber.toString().padStart(4, '0')}`;
    }
    async create(createEmployeeDto) {
        if (!createEmployeeDto.employeeCode) {
            createEmployeeDto.employeeCode = await this.generateEmployeeCode();
        }
        const existingEmployee = await this.employeeRepository.findOne({
            where: { employeeCode: createEmployeeDto.employeeCode },
        });
        if (existingEmployee) {
            throw new common_1.ConflictException('Employee code already exists');
        }
        const existingEmail = await this.employeeRepository.findOne({
            where: { email: createEmployeeDto.email },
        });
        if (existingEmail) {
            throw new common_1.ConflictException('Email already exists');
        }
        const department = await this.departmentRepository.findOne({
            where: { id: createEmployeeDto.departmentId },
        });
        if (!department) {
            throw new common_1.BadRequestException('Department not found');
        }
        const position = await this.positionRepository.findOne({
            where: { id: createEmployeeDto.positionId },
        });
        if (!position) {
            throw new common_1.BadRequestException('Position not found');
        }
        if (createEmployeeDto.workLocationId) {
            const wl = await this.workLocationRepository.findOne({ where: { id: createEmployeeDto.workLocationId } });
            if (!wl) {
                throw new common_1.BadRequestException('Work location not found');
            }
        }
        if (createEmployeeDto.shiftId) {
            const sh = await this.shiftRepository.findOne({ where: { id: createEmployeeDto.shiftId } });
            if (!sh) {
                throw new common_1.BadRequestException('Shift not found');
            }
        }
        const employee = this.employeeRepository.create(createEmployeeDto);
        const savedEmployee = await this.employeeRepository.save(employee);
        if (createEmployeeDto.password) {
            const employeeRole = await this.roleRepository.findOne({ where: { name: role_entity_1.RoleName.EMPLOYEE } });
            if (!employeeRole) {
                throw new common_1.BadRequestException('Employee role not found');
            }
            const bcrypt = await Promise.resolve().then(() => require('bcrypt'));
            const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);
            const user = this.userRepository.create({
                email: createEmployeeDto.email,
                password: hashedPassword,
                firstName: createEmployeeDto.firstName,
                lastName: createEmployeeDto.lastName,
                phone: createEmployeeDto.phone,
                roleId: employeeRole.id,
            });
            user.employee = savedEmployee;
            const savedUser = await this.userRepository.save(user);
            savedEmployee.user = savedUser;
            await this.employeeRepository.save(savedEmployee);
        }
        return this.findOne(savedEmployee.id);
    }
    async findAll() {
        return this.employeeRepository.find({
            relations: ['department', 'position', 'user', 'workLocation', 'shift', 'dependents'],
        });
    }
    async findOne(id) {
        const employee = await this.employeeRepository.findOne({
            where: { id },
            relations: ['department', 'position', 'user', 'workLocation', 'shift', 'dependents'],
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return employee;
    }
    async findByCode(employeeCode) {
        const employee = await this.employeeRepository.findOne({
            where: { employeeCode },
            relations: ['department', 'position', 'user', 'workLocation', 'shift'],
        });
        if (!employee) {
            throw new common_1.NotFoundException('Employee not found');
        }
        return employee;
    }
    async update(id, updateEmployeeDto) {
        const employee = await this.findOne(id);
        if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
            const existingEmail = await this.employeeRepository.findOne({
                where: { email: updateEmployeeDto.email },
            });
            if (existingEmail) {
                throw new common_1.ConflictException('Email already exists');
            }
        }
        if (updateEmployeeDto.employeeCode && updateEmployeeDto.employeeCode !== employee.employeeCode) {
            const existingEmployee = await this.employeeRepository.findOne({
                where: { employeeCode: updateEmployeeDto.employeeCode },
            });
            if (existingEmployee) {
                throw new common_1.ConflictException('Employee code already exists');
            }
        }
        if (updateEmployeeDto.departmentId) {
            const department = await this.departmentRepository.findOne({
                where: { id: updateEmployeeDto.departmentId },
            });
            if (!department) {
                throw new common_1.BadRequestException('Department not found');
            }
        }
        if (updateEmployeeDto.positionId) {
            const position = await this.positionRepository.findOne({
                where: { id: updateEmployeeDto.positionId },
            });
            if (!position) {
                throw new common_1.BadRequestException('Position not found');
            }
        }
        if (updateEmployeeDto.workLocationId !== undefined) {
            if (updateEmployeeDto.workLocationId) {
                const workLocation = await this.workLocationRepository.findOne({
                    where: { id: updateEmployeeDto.workLocationId },
                });
                if (!workLocation) {
                    throw new common_1.BadRequestException('Work location not found');
                }
            }
        }
        if (updateEmployeeDto.shiftId !== undefined) {
            if (updateEmployeeDto.shiftId) {
                const shift = await this.shiftRepository.findOne({
                    where: { id: updateEmployeeDto.shiftId },
                });
                if (!shift) {
                    throw new common_1.BadRequestException('Shift not found');
                }
            }
        }
        if (employee.user) {
            if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.user.email) {
                const userEmailExists = await this.userRepository.findOne({ where: { email: updateEmployeeDto.email } });
                if (userEmailExists) {
                    throw new common_1.ConflictException('User email already in use');
                }
                employee.user.email = updateEmployeeDto.email;
            }
            if (updateEmployeeDto.password) {
                const bcrypt = await Promise.resolve().then(() => require('bcrypt'));
                const saltRounds = 10;
                employee.user.password = await bcrypt.hash(updateEmployeeDto.password, saltRounds);
            }
            employee.user.employee = employee;
            await this.userRepository.save(employee.user);
        }
        else if (updateEmployeeDto.password) {
            const employeeRole = await this.roleRepository.findOne({ where: { name: role_entity_1.RoleName.EMPLOYEE } });
            if (!employeeRole) {
                throw new common_1.BadRequestException('Employee role not found');
            }
            const userEmailExists = await this.userRepository.findOne({ where: { email: updateEmployeeDto.email || employee.email } });
            if (userEmailExists) {
                throw new common_1.ConflictException('User email already in use');
            }
            const bcrypt = await Promise.resolve().then(() => require('bcrypt'));
            const hashedPassword = await bcrypt.hash(updateEmployeeDto.password, 10);
            const user = this.userRepository.create({
                email: updateEmployeeDto.email || employee.email,
                password: hashedPassword,
                firstName: updateEmployeeDto.firstName || employee.firstName,
                lastName: updateEmployeeDto.lastName || employee.lastName,
                phone: updateEmployeeDto.phone || employee.phone,
                roleId: employeeRole.id,
            });
            user.employee = employee;
            const savedUser = await this.userRepository.save(user);
            employee.user = savedUser;
        }
        const updateData = {};
        if (updateEmployeeDto.employeeCode)
            updateData.employeeCode = updateEmployeeDto.employeeCode;
        if (updateEmployeeDto.firstName)
            updateData.firstName = updateEmployeeDto.firstName;
        if (updateEmployeeDto.lastName)
            updateData.lastName = updateEmployeeDto.lastName;
        if (updateEmployeeDto.email)
            updateData.email = updateEmployeeDto.email;
        if (updateEmployeeDto.phone !== undefined)
            updateData.phone = updateEmployeeDto.phone;
        if (updateEmployeeDto.address !== undefined)
            updateData.address = updateEmployeeDto.address;
        if (updateEmployeeDto.permanentAddress !== undefined)
            updateData.permanentAddress = updateEmployeeDto.permanentAddress;
        if (updateEmployeeDto.currentAddress !== undefined)
            updateData.currentAddress = updateEmployeeDto.currentAddress;
        if (updateEmployeeDto.dateOfBirth)
            updateData.dateOfBirth = new Date(updateEmployeeDto.dateOfBirth);
        if (updateEmployeeDto.gender)
            updateData.gender = updateEmployeeDto.gender;
        if (updateEmployeeDto.nationalId !== undefined)
            updateData.nationalId = updateEmployeeDto.nationalId;
        if (updateEmployeeDto.citizenId !== undefined)
            updateData.citizenId = updateEmployeeDto.citizenId;
        if (updateEmployeeDto.taxId !== undefined)
            updateData.taxId = updateEmployeeDto.taxId;
        if (updateEmployeeDto.bankAccount !== undefined)
            updateData.bankAccount = updateEmployeeDto.bankAccount;
        if (updateEmployeeDto.bankName !== undefined)
            updateData.bankName = updateEmployeeDto.bankName;
        if (updateEmployeeDto.ethnicity !== undefined)
            updateData.ethnicity = updateEmployeeDto.ethnicity;
        if (updateEmployeeDto.religion !== undefined)
            updateData.religion = updateEmployeeDto.religion;
        if (updateEmployeeDto.basicSalary !== undefined)
            updateData.basicSalary = updateEmployeeDto.basicSalary;
        if (updateEmployeeDto.allowance !== undefined)
            updateData.allowance = updateEmployeeDto.allowance;
        if (updateEmployeeDto.hireDate)
            updateData.hireDate = new Date(updateEmployeeDto.hireDate);
        if (updateEmployeeDto.status)
            updateData.status = updateEmployeeDto.status;
        if (updateEmployeeDto.avatar !== undefined)
            updateData.avatar = updateEmployeeDto.avatar;
        if (updateEmployeeDto.emergencyContact !== undefined)
            updateData.emergencyContact = updateEmployeeDto.emergencyContact;
        if (updateEmployeeDto.emergencyPhone !== undefined)
            updateData.emergencyPhone = updateEmployeeDto.emergencyPhone;
        if (updateEmployeeDto.departmentId !== undefined) {
            updateData.departmentId = updateEmployeeDto.departmentId || null;
        }
        if (updateEmployeeDto.positionId !== undefined) {
            updateData.positionId = updateEmployeeDto.positionId || null;
        }
        if (updateEmployeeDto.workLocationId !== undefined) {
            updateData.workLocationId = updateEmployeeDto.workLocationId || null;
        }
        if (updateEmployeeDto.shiftId !== undefined) {
            updateData.shiftId = updateEmployeeDto.shiftId || null;
        }
        Object.assign(employee, updateData);
        await this.employeeRepository.save(employee);
        return this.findOne(id);
    }
    async updateAvatar(id, filename) {
        const employee = await this.findOne(id);
        employee.avatar = `/uploads/${filename}`;
        return this.employeeRepository.save(employee);
    }
    async remove(id) {
        const employee = await this.findOne(id);
        const hasAttendance = await this.employeeRepository.query('SELECT COUNT(*) FROM attendances WHERE "employeeId" = $1', [id]);
        const hasLeaveRequests = await this.employeeRepository.query('SELECT COUNT(*) FROM leave_requests WHERE "employeeId" = $1', [id]);
        const hasResignationRequests = await this.employeeRepository.query('SELECT COUNT(*) FROM resignation_requests WHERE "employeeId" = $1', [id]);
        const hasPayrolls = await this.employeeRepository.query('SELECT COUNT(*) FROM payrolls WHERE "employeeId" = $1', [id]);
        if (hasAttendance[0].count > 0 || hasLeaveRequests[0].count > 0 ||
            hasResignationRequests[0].count > 0 || hasPayrolls[0].count > 0) {
            throw new common_1.BadRequestException('Cannot delete employee with existing records. Please remove related data first.');
        }
        if (employee.user?.id) {
            await this.employeeRepository.query('UPDATE users SET "employeeId" = NULL WHERE "employeeId" = $1', [id]);
        }
        await this.employeeRepository.query('DELETE FROM employees WHERE id = $1', [id]);
    }
    async getActiveEmployees() {
        return this.employeeRepository.find({
            where: { status: employee_entity_1.EmployeeStatus.ACTIVE },
            relations: ['department', 'position', 'workLocation', 'shift'],
        });
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(employee_entity_1.Employee)),
    __param(1, (0, typeorm_1.InjectRepository)(department_entity_1.Department)),
    __param(2, (0, typeorm_1.InjectRepository)(position_entity_1.Position)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_1.InjectRepository)(role_entity_1.Role)),
    __param(5, (0, typeorm_1.InjectRepository)(work_location_entity_1.WorkLocation)),
    __param(6, (0, typeorm_1.InjectRepository)(shift_entity_1.Shift)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map