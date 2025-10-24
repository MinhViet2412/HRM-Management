import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OvertimeRequest } from '../database/entities/overtime-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { OvertimeService } from './overtime.service';
import { OvertimeController } from './overtime.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OvertimeRequest, Employee])],
  providers: [OvertimeService],
  controllers: [OvertimeController],
  exports: [OvertimeService],
})
export class OvertimeModule {}


