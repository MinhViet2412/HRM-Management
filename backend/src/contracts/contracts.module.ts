import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contract } from '../database/entities/contract.entity';
import { ContractTemplate } from '../database/entities/contract-template.entity';
import { Employee } from '../database/entities/employee.entity';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { EmployeesModule } from '../employees/employees.module';
import { ContractTypesModule } from '../contract-types/contract-types.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Contract, ContractTemplate, Employee]), 
    EmployeesModule,
    ContractTypesModule
  ],
  providers: [ContractsService],
  controllers: [ContractsController],
  exports: [ContractsService],
})
export class ContractsModule {}


