import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TaxConfigService } from './tax-config.service';
import { UpdateTaxConfigDto, UpdateDependentDeductionDto } from './dto/update-tax-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tax Config')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tax-config')
export class TaxConfigController {
  constructor(private readonly taxConfigService: TaxConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tax configurations' })
  findAll() {
    return this.taxConfigService.findAll();
  }

  @Get('dependent-deduction')
  @ApiOperation({ summary: 'Get dependent deduction amount' })
  getDependentDeductionAmount() {
    return this.taxConfigService.getDependentDeductionAmount();
  }

  @Patch('dependent-deduction')
  @ApiOperation({ summary: 'Update dependent deduction amount' })
  updateDependentDeductionAmount(@Body() dto: UpdateDependentDeductionDto) {
    return this.taxConfigService.updateDependentDeductionAmount(dto);
  }

  @Get(':key')
  @ApiOperation({ summary: 'Get tax config by key' })
  findByKey(@Param('key') key: string) {
    return this.taxConfigService.findByKey(key);
  }

  @Patch(':key')
  @ApiOperation({ summary: 'Update tax config by key' })
  update(
    @Param('key') key: string,
    @Body() updateDto: UpdateTaxConfigDto,
  ) {
    return this.taxConfigService.update(key, updateDto);
  }
}

