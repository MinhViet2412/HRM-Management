import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from '../database/entities/employee.entity';
import { Department } from '../database/entities/department.entity';
import { Position } from '../database/entities/position.entity';
import { User } from '../database/entities/user.entity';
import { Role } from '../database/entities/role.entity';
import { WorkLocation } from '../database/entities/work-location.entity';
import { Shift } from '../database/entities/shift.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Department, Position, User, Role, WorkLocation, Shift])],
  providers: [EmployeesService],
  controllers: [EmployeesController],
  exports: [EmployeesService],
})
export class EmployeesModule {}
