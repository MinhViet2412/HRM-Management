import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OvertimeService } from './overtime.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '../database/entities/role.entity';
import { CreateOvertimeDto } from './dto/create-overtime.dto';
import { ApproveOvertimeDto } from './dto/approve-overtime.dto';

@ApiTags('Overtime Requests')
@Controller('overtime')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OvertimeController {
  constructor(private readonly overtimeService: OvertimeService) {}

  @Post()
  @Roles(RoleName.EMPLOYEE)
  @ApiOperation({ summary: 'Employee creates an OT request' })
  create(@Body() dto: CreateOvertimeDto, @Request() req) {
    // employeeId is attached to JWT via strategy
    return this.overtimeService.create(req.user.id, req.user.employeeId, dto);
  }

  @Get('me')
  @Roles(RoleName.EMPLOYEE)
  @ApiOperation({ summary: 'List my OT requests' })
  listMy(@Request() req) {
    return this.overtimeService.listMy(req.user.employeeId);
  }

  @Get('assigned')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'List OT requests assigned to me (approver)' })
  listAssigned(@Request() req) {
    return this.overtimeService.listAssigned(req.user.id);
  }

  // Assignment endpoint retained for future admin tooling; not used in employee creation flow

  @Post(':id/approve')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Approve an OT request' })
  approve(@Param('id') id: string, @Body() dto: ApproveOvertimeDto, @Request() req) {
    return this.overtimeService.approve(id, req.user.id, dto);
  }

  @Post(':id/reject')
  @Roles(RoleName.MANAGER, RoleName.ADMIN, RoleName.HR)
  @ApiOperation({ summary: 'Reject an OT request' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
    return this.overtimeService.reject(id, req.user.id, reason);
  }
}


