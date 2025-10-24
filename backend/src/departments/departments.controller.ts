import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Departments')
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create a new department' })
  @ApiResponse({ status: 201, description: 'Department created successfully' })
  async create(@Body() createDepartmentDto: any) {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all departments' })
  @ApiResponse({ status: 200, description: 'Departments retrieved successfully' })
  async findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get department by ID' })
  @ApiResponse({ status: 200, description: 'Department retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Department not found' })
  async findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Update department' })
  @ApiResponse({ status: 200, description: 'Department updated successfully' })
  async update(@Param('id') id: string, @Body() updateDepartmentDto: any) {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Delete department' })
  @ApiResponse({ status: 200, description: 'Department deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(id);
    return { message: 'Department deleted successfully' };
  }
}
