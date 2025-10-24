import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { Express } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiResponse({ status: 201, description: 'Employee created successfully' })
  @ApiResponse({ status: 409, description: 'Employee code or email already exists' })
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Post('upload-avatar/:id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadAvatar(@Param('id') id: string, @UploadedFile() file: any) {
    return this.employeesService.updateAvatar(id, file.filename);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER, RoleName.EMPLOYEE)
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, description: 'Employees retrieved successfully' })
  @ApiQuery({ name: 'active', required: false, type: Boolean })
  async findAll(@Query('active') active?: boolean) {
    if (active) {
      return this.employeesService.getActiveEmployees();
    }
    return this.employeesService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER, RoleName.EMPLOYEE)
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Get('code/:code')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get employee by employee code' })
  @ApiResponse({ status: 200, description: 'Employee retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async findByCode(@Param('code') code: string) {
    return this.employeesService.findByCode(code);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.EMPLOYEE)
  @ApiOperation({ summary: 'Update employee' })
  @ApiResponse({ status: 200, description: 'Employee updated successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Delete employee' })
  @ApiResponse({ status: 200, description: 'Employee deleted successfully' })
  @ApiResponse({ status: 404, description: 'Employee not found' })
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(id);
    return { message: 'Employee deleted successfully' };
  }
}
