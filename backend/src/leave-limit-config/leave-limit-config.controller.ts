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
import { LeaveLimitConfigService } from './leave-limit-config.service';
import { CreateLeaveLimitConfigDto } from './dto/create-leave-limit-config.dto';
import { UpdateLeaveLimitConfigDto } from './dto/update-leave-limit-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';

@ApiTags('Leave Limit Config')
@Controller('leave-limit-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeaveLimitConfigController {
  constructor(
    private readonly leaveLimitConfigService: LeaveLimitConfigService,
  ) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Create a new leave limit configuration' })
  create(@Body() createDto: CreateLeaveLimitConfigDto) {
    return this.leaveLimitConfigService.create(createDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all leave limit configurations' })
  findAll(@Query('year') year?: string) {
    if (year) {
      return this.leaveLimitConfigService.findByYear(parseInt(year));
    }
    return this.leaveLimitConfigService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get a leave limit configuration by ID' })
  findOne(@Param('id') id: string) {
    return this.leaveLimitConfigService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Update a leave limit configuration' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateLeaveLimitConfigDto,
  ) {
    return this.leaveLimitConfigService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Delete a leave limit configuration' })
  remove(@Param('id') id: string) {
    return this.leaveLimitConfigService.remove(id);
  }
}

