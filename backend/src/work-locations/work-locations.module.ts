import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkLocation } from '../database/entities/work-location.entity';
import { WorkLocationsService } from './work-locations.service';
import { WorkLocationsController } from './work-locations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkLocation])],
  providers: [WorkLocationsService],
  controllers: [WorkLocationsController],
  exports: [WorkLocationsService],
})
export class WorkLocationsModule {}


