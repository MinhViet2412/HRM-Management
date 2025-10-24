import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Positions')
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create a new position' })
  @ApiResponse({ status: 201, description: 'Position created successfully' })
  async create(@Body() createPositionDto: any) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all positions' })
  @ApiResponse({ status: 200, description: 'Positions retrieved successfully' })
  async findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiResponse({ status: 200, description: 'Position retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Position not found' })
  async findOne(@Param('id') id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Update position' })
  @ApiResponse({ status: 200, description: 'Position updated successfully' })
  async update(@Param('id') id: string, @Body() updatePositionDto: any) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Delete position' })
  @ApiResponse({ status: 200, description: 'Position deleted successfully' })
  async remove(@Param('id') id: string) {
    await this.positionsService.remove(id);
    return { message: 'Position deleted successfully' };
  }
}
