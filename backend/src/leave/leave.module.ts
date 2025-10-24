import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveRequest, Employee])],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
