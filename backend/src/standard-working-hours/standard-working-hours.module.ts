import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StandardWorkingHoursService } from './standard-working-hours.service';
import { StandardWorkingHoursController } from './standard-working-hours.controller';
import { StandardWorkingHours } from '../database/entities/standard-working-hours.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StandardWorkingHours])],
  providers: [StandardWorkingHoursService],
  controllers: [StandardWorkingHoursController],
  exports: [StandardWorkingHoursService],
})
export class StandardWorkingHoursModule {}

