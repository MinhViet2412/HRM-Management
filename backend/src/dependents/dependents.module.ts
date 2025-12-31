import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DependentsService } from './dependents.service';
import { DependentsController } from './dependents.controller';
import { Dependent } from '../database/entities/dependent.entity';
import { Employee } from '../database/entities/employee.entity';
import { TaxConfigModule } from '../tax-config/tax-config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Dependent, Employee]),
    TaxConfigModule,
  ],
  controllers: [DependentsController],
  providers: [DependentsService],
  exports: [DependentsService],
})
export class DependentsModule {}

