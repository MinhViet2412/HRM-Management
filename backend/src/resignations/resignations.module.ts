import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResignationsService } from './resignations.service';
import { ResignationsController } from './resignations.controller';
import { ResignationRequest } from '../database/entities/resignation-request.entity';
import { Employee } from '../database/entities/employee.entity';
import { User } from '../database/entities/user.entity';
import { ResignationsProcessor } from './resignations.processor';

@Module({
  imports: [TypeOrmModule.forFeature([ResignationRequest, Employee, User])],
  controllers: [ResignationsController],
  providers: [ResignationsService, ResignationsProcessor],
})
export class ResignationsModule {}


