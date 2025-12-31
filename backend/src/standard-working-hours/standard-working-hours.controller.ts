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
import { StandardWorkingHoursService } from './standard-working-hours.service';
import { CreateStandardWorkingHoursDto } from './dto/create-standard-working-hours.dto';
import { UpdateStandardWorkingHoursDto } from './dto/update-standard-working-hours.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Standard Working Hours')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('standard-working-hours')
export class StandardWorkingHoursController {
  constructor(
    private readonly standardWorkingHoursService: StandardWorkingHoursService,
  ) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create standard working hours configuration' })
  create(@Body() createDto: CreateStandardWorkingHoursDto) {
    return this.standardWorkingHoursService.create(createDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all standard working hours configurations' })
  findAll() {
    return this.standardWorkingHoursService.findAll();
  }

  @Get('period/:period')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get standard working hours by period (YYYY-MM)' })
  getByPeriod(@Param('period') period: string) {
    return this.standardWorkingHoursService.getByPeriod(period);
  }

  @Get('calculate/:year/:month')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get or calculate standard working hours for a month' })
  getOrCalculate(
    @Param('year') year: string,
    @Param('month') month: string,
  ) {
    return this.standardWorkingHoursService.getOrCalculate(
      parseInt(year),
      parseInt(month),
    );
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get standard working hours by ID' })
  findOne(@Param('id') id: string) {
    return this.standardWorkingHoursService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Update standard working hours configuration' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateStandardWorkingHoursDto,
  ) {
    return this.standardWorkingHoursService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Delete standard working hours configuration' })
  remove(@Param('id') id: string) {
    return this.standardWorkingHoursService.remove(id);
  }
}

