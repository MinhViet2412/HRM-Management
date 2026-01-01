import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveService } from './leave.service';
import { LeaveController } from './leave.controller';
import { LeaveRequest } from '../database/entities/leave-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { LeaveLimitConfigModule } from '../leave-limit-config/leave-limit-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveRequest, Employee]),
    LeaveLimitConfigModule,
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
