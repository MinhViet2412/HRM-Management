import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DependentsService } from './dependents.service';
import { CreateDependentDto } from './dto/create-dependent.dto';
import { UpdateDependentDto } from './dto/update-dependent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dependents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dependents')
export class DependentsController {
  constructor(private readonly dependentsService: DependentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new dependent' })
  create(@Body() createDependentDto: CreateDependentDto) {
    return this.dependentsService.create(createDependentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all dependents' })
  findAll(@Query('employeeId') employeeId?: string) {
    return this.dependentsService.findAll(employeeId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get all dependents for an employee' })
  findByEmployeeId(@Param('employeeId') employeeId: string) {
    return this.dependentsService.findByEmployeeId(employeeId);
  }

  @Get('count/:employeeId')
  @ApiOperation({ summary: 'Get count of active dependents for an employee' })
  getActiveCount(@Param('employeeId') employeeId: string) {
    return this.dependentsService.getActiveDependentsCount(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a dependent by ID' })
  findOne(@Param('id') id: string) {
    return this.dependentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dependent' })
  update(
    @Param('id') id: string,
    @Body() updateDependentDto: UpdateDependentDto,
  ) {
    return this.dependentsService.update(id, updateDependentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a dependent' })
  remove(@Param('id') id: string) {
    return this.dependentsService.remove(id);
  }
}

