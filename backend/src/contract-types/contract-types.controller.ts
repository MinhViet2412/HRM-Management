import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ContractTypesService } from './contract-types.service';
import { CreateContractTypeDto, UpdateContractTypeDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '../database/entities/role.entity';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Contract Types')
@ApiBearerAuth()
@Controller('contract-types')
export class ContractTypesController {
  constructor(private readonly contractTypesService: ContractTypesService) {}

  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Post()
  create(@Body() dto: CreateContractTypeDto) {
    return this.contractTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.contractTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractTypesService.findOne(id);
  }

  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateContractTypeDto) {
    return this.contractTypesService.update(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractTypesService.remove(id);
  }
}
