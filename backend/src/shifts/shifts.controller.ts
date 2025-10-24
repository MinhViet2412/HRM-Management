import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Shifts')
@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ShiftsController {
  constructor(private readonly service: ShiftsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create shift' })
  create(@Body() body: { name: string; startTime: string; endTime: string }) {
    return this.service.create(body)
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  findAll() { return this.service.findAll() }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  findOne(@Param('id') id: string) { return this.service.findOne(id) }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; startTime: string; endTime: string }>) {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  remove(@Param('id') id: string) { return this.service.remove(id) }
}


