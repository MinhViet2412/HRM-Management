import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractType } from '../database/entities/contract-type.entity';
import { ContractTypesService } from './contract-types.service';
import { ContractTypesController } from './contract-types.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ContractType])],
  providers: [ContractTypesService],
  controllers: [ContractTypesController],
  exports: [ContractTypesService],
})
export class ContractTypesModule {}
