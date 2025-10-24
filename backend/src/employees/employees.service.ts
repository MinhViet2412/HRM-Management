import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee, EmployeeStatus } from '../database/entities/employee.entity';
import { Department } from '../database/entities/department.entity';
import { Position } from '../database/entities/position.entity';
import { User } from '../database/entities/user.entity';
import { Role, RoleName } from '../database/entities/role.entity';
import { WorkLocation } from '../database/entities/work-location.entity';
import { Shift } from '../database/entities/shift.entity';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(WorkLocation)
    private workLocationRepository: Repository<WorkLocation>,
    @InjectRepository(Shift)
    private shiftRepository: Repository<Shift>,
  ) {}

  /**
   * Generate next employee code with format EMP0001, EMP0002, etc.
   */
  private async generateEmployeeCode(): Promise<string> {
    // Find all employee codes with EMP prefix and extract numbers
    const employees = await this.employeeRepository
      .createQueryBuilder('employee')
      .select('employee.employeeCode')
      .where('employee.employeeCode LIKE :prefix', { prefix: 'EMP%' })
      .getMany();

    if (employees.length === 0) {
      // First employee
      return 'EMP0001';
    }

    // Extract numbers from all EMP codes and find the highest
    let maxNumber = 0;
    employees.forEach(emp => {
      const match = emp.employeeCode.match(/^EMP(\d+)$/);
      if (match) {
        const number = parseInt(match[1], 10);
        maxNumber = Math.max(maxNumber, number);
      }
    });

    const nextNumber = maxNumber + 1;
    
    // Format with leading zeros (4 digits)
    return `EMP${nextNumber.toString().padStart(4, '0')}`;
  }

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // Generate employee code if not provided
    if (!createEmployeeDto.employeeCode) {
      createEmployeeDto.employeeCode = await this.generateEmployeeCode();
    }

    // Check if employee code already exists
    const existingEmployee = await this.employeeRepository.findOne({
      where: { employeeCode: createEmployeeDto.employeeCode },
    });

    if (existingEmployee) {
      throw new ConflictException('Employee code already exists');
    }

    // Check if email already exists
    const existingEmail = await this.employeeRepository.findOne({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    // Validate department and position
    const department = await this.departmentRepository.findOne({
      where: { id: createEmployeeDto.departmentId },
    });

    if (!department) {
      throw new BadRequestException('Department not found');
    }

    const position = await this.positionRepository.findOne({
      where: { id: createEmployeeDto.positionId },
    });

    if (!position) {
      throw new BadRequestException('Position not found');
    }

    // Optional work location
    if (createEmployeeDto.workLocationId) {
      const wl = await this.workLocationRepository.findOne({ where: { id: createEmployeeDto.workLocationId } });
      if (!wl) {
        throw new BadRequestException('Work location not found');
      }
    }

    // Optional shift
    if (createEmployeeDto.shiftId) {
      const sh = await this.shiftRepository.findOne({ where: { id: createEmployeeDto.shiftId } });
      if (!sh) {
        throw new BadRequestException('Shift not found');
      }
    }

    const employee = this.employeeRepository.create(createEmployeeDto);
    const savedEmployee = await this.employeeRepository.save(employee);

    // If password provided on create, also create a linked User with EMPLOYEE role
    if (createEmployeeDto.password) {
      const employeeRole = await this.roleRepository.findOne({ where: { name: RoleName.EMPLOYEE } });
      if (!employeeRole) {
        throw new BadRequestException('Employee role not found');
      }
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash(createEmployeeDto.password, 10);

      const user = this.userRepository.create({
        email: createEmployeeDto.email,
        password: hashedPassword,
        firstName: createEmployeeDto.firstName,
        lastName: createEmployeeDto.lastName,
        phone: createEmployeeDto.phone,
        roleId: employeeRole.id,
      });
      // link both ways to ensure FK on User (owner side) is set
      user.employee = savedEmployee;
      const savedUser = await this.userRepository.save(user);
      savedEmployee.user = savedUser;
      await this.employeeRepository.save(savedEmployee);
    }

    return this.findOne(savedEmployee.id);
  }

  async findAll(): Promise<Employee[]> {
    return this.employeeRepository.find({
      relations: ['department', 'position', 'user', 'workLocation'],
    });
  }

  async findOne(id: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
      relations: ['department', 'position', 'user', 'workLocation'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async findByCode(employeeCode: string): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { employeeCode },
      relations: ['department', 'position', 'user'],
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);

    // Check for conflicts if updating email or employee code
    if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.email) {
      const existingEmail = await this.employeeRepository.findOne({
        where: { email: updateEmployeeDto.email },
      });

      if (existingEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    if (updateEmployeeDto.employeeCode && updateEmployeeDto.employeeCode !== employee.employeeCode) {
      const existingEmployee = await this.employeeRepository.findOne({
        where: { employeeCode: updateEmployeeDto.employeeCode },
      });

      if (existingEmployee) {
        throw new ConflictException('Employee code already exists');
      }
    }

    // Validate department and position if updating
    if (updateEmployeeDto.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: updateEmployeeDto.departmentId },
      });

      if (!department) {
        throw new BadRequestException('Department not found');
      }
    }

    if (updateEmployeeDto.positionId) {
      const position = await this.positionRepository.findOne({
        where: { id: updateEmployeeDto.positionId },
      });

      if (!position) {
        throw new BadRequestException('Position not found');
      }
    }

    // Validate work location if updating
    if (updateEmployeeDto.workLocationId) {
      const workLocation = await this.workLocationRepository.findOne({
        where: { id: updateEmployeeDto.workLocationId },
      });

      if (!workLocation) {
        throw new BadRequestException('Work location not found');
      }
    }

    // Validate shift if updating
    if (updateEmployeeDto.shiftId) {
      const shift = await this.shiftRepository.findOne({
        where: { id: updateEmployeeDto.shiftId },
      });

      if (!shift) {
        throw new BadRequestException('Shift not found');
      }
    }

    // Sync to linked user (create if missing and password provided)
    if (employee.user) {
      // If email is changing, ensure unique on users and update
      if (updateEmployeeDto.email && updateEmployeeDto.email !== employee.user.email) {
        const userEmailExists = await this.userRepository.findOne({ where: { email: updateEmployeeDto.email } });
        if (userEmailExists) {
          throw new ConflictException('User email already in use');
        }
        employee.user.email = updateEmployeeDto.email;
      }

      // If password provided, hash and update
      if (updateEmployeeDto.password) {
        const bcrypt = await import('bcrypt');
        const saltRounds = 10;
        employee.user.password = await bcrypt.hash(updateEmployeeDto.password, saltRounds);
      }

      // ensure relation is linked
      employee.user.employee = employee;
      await this.userRepository.save(employee.user);
    } else if (updateEmployeeDto.password) {
      // Create a new user and link it when password is provided on update
      const employeeRole = await this.roleRepository.findOne({ where: { name: RoleName.EMPLOYEE } });
      if (!employeeRole) {
        throw new BadRequestException('Employee role not found');
      }

      // Ensure user email unique
      const userEmailExists = await this.userRepository.findOne({ where: { email: updateEmployeeDto.email || employee.email } });
      if (userEmailExists) {
        throw new ConflictException('User email already in use');
      }

      const bcrypt = await import('bcrypt');
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

    Object.assign(employee, updateEmployeeDto);
    await this.employeeRepository.save(employee);
    return this.findOne(id);
  }

  async updateAvatar(id: string, filename: string): Promise<Employee> {
    const employee = await this.findOne(id);
    employee.avatar = `/uploads/${filename}`;
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findOne(id);
    
    // Check if employee has related data that prevents deletion
    const hasAttendance = await this.employeeRepository.query(
      'SELECT COUNT(*) FROM attendances WHERE "employeeId" = $1',
      [id]
    );
    
    const hasLeaveRequests = await this.employeeRepository.query(
      'SELECT COUNT(*) FROM leave_requests WHERE "employeeId" = $1',
      [id]
    );
    
    const hasResignationRequests = await this.employeeRepository.query(
      'SELECT COUNT(*) FROM resignation_requests WHERE "employeeId" = $1',
      [id]
    );
    
    const hasPayrolls = await this.employeeRepository.query(
      'SELECT COUNT(*) FROM payrolls WHERE "employeeId" = $1',
      [id]
    );
    
    if (hasAttendance[0].count > 0 || hasLeaveRequests[0].count > 0 || 
        hasResignationRequests[0].count > 0 || hasPayrolls[0].count > 0) {
      throw new BadRequestException('Cannot delete employee with existing records. Please remove related data first.');
    }
    
    // Handle circular foreign key constraint between users and employees
    // First, set employeeId to NULL in users table to break the constraint
    if (employee.user?.id) {
      await this.employeeRepository.query(
        'UPDATE users SET "employeeId" = NULL WHERE "employeeId" = $1',
        [id]
      );
    }
    
    // Then delete the employee
    await this.employeeRepository.query(
      'DELETE FROM employees WHERE id = $1',
      [id]
    );
  }

  async getActiveEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find({
      where: { status: EmployeeStatus.ACTIVE },
      relations: ['department', 'position'],
    });
  }
}
