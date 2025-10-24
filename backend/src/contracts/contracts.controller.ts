import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, ParseUUIDPipe, Req } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import {
  CreateContractDto,
  UpdateContractDto,
  CreateContractTemplateDto,
  UpdateContractTemplateDto,
} from './dto';
import { ContractTypesService } from '../contract-types/contract-types.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleName } from '../database/entities/role.entity';
import { Request } from 'express';
import { ContractStatus } from '../database/entities/contract.entity';

@UseGuards(JwtAuthGuard)
@ApiTags('Contracts')
@ApiBearerAuth()
@Controller('contracts')
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly contractTypesService: ContractTypesService,
  ) {}

  // Contracts - Admin/HR/Manager create/update/delete, Employee read
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @Post()
  create(@Body() dto: CreateContractDto) {
    return this.contractsService.createContract(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.EMPLOYEE)
  @Get()
  findAll(@Req() req: Request) {
    const user: any = (req as any).user;
    return this.contractsService.getContracts({
      role: user?.role?.name || user?.role,
      employeeId: user?.employeeId || user?.employee?.id,
      departmentId: user?.employee?.departmentId,
    });
  }

  @Get('types')
  findTypes() {
    return this.contractTypesService.findAll();
  }

  // Templates - MANAGER only
  @Roles(RoleName.MANAGER)
  @Post('templates')
  createTemplate(@Body() dto: CreateContractTemplateDto) {
    return this.contractsService.createTemplate(dto);
  }

  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Get('templates')
  findTemplates() {
    return this.contractsService.getTemplates();
  }

  @Roles(RoleName.MANAGER)
  @Patch('templates/:id')
  updateTemplate(@Param('id') id: string, @Body() dto: UpdateContractTemplateDto) {
    return this.contractsService.updateTemplate(id, dto);
  }

  @Roles(RoleName.MANAGER)
  @Delete('templates/:id')
  removeTemplate(@Param('id') id: string) {
    return this.contractsService.deleteTemplate(id);
  }

  // Contract by id - MANAGER only
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.EMPLOYEE)
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string, @Req() req: Request) {
    const user: any = (req as any).user;
    return this.contractsService.getContract(id, {
      role: user?.role?.name || user?.role,
      employeeId: user?.employeeId || user?.employee?.id,
      departmentId: user?.employee?.departmentId,
    });
  }

  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @Patch(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateContractDto) {
    return this.contractsService.updateContract(id, dto);
  }

  @Roles(RoleName.ADMIN, RoleName.HR, RoleName.MANAGER)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractsService.deleteContract(id);
  }

  // Approve / Reject
  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Post(':id/approve')
  approve(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contractsService.approveContract(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @Post(':id/reject')
  reject(@Param('id', new ParseUUIDPipe()) id: string, @Body('reason') reason?: string) {
    return this.contractsService.rejectContract(id, reason);
  }
}


