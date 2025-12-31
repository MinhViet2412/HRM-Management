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
import { InsuranceConfigService } from './insurance-config.service';
import { CreateInsuranceConfigDto } from './dto/create-insurance-config.dto';
import { UpdateInsuranceConfigDto } from './dto/update-insurance-config.dto';
import { InsuranceType } from '../database/entities/insurance-config.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Insurance Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insurance-config')
export class InsuranceConfigController {
  constructor(private readonly insuranceConfigService: InsuranceConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insurance config' })
  create(@Body() createDto: CreateInsuranceConfigDto) {
    return this.insuranceConfigService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance configs' })
  findAll(@Query('activeOnly') activeOnly?: string) {
    if (activeOnly === 'true') {
      return this.insuranceConfigService.findActive();
    }
    return this.insuranceConfigService.findAll();
  }

  @Get('calculate')
  @ApiOperation({ summary: 'Calculate insurance amount' })
  calculate(
    @Query('salary') salary: string,
    @Query('type') type: InsuranceType,
  ) {
    const salaryNum = parseFloat(salary);
    return this.insuranceConfigService.calculateTotalInsurance(salaryNum, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get insurance config by ID' })
  findOne(@Param('id') id: string) {
    return this.insuranceConfigService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update insurance config' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInsuranceConfigDto,
  ) {
    return this.insuranceConfigService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete insurance config' })
  remove(@Param('id') id: string) {
    return this.insuranceConfigService.remove(id);
  }
}

