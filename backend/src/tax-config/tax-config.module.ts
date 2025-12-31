import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaxConfigService } from './tax-config.service';
import { TaxConfigController } from './tax-config.controller';
import { TaxConfig } from '../database/entities/tax-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TaxConfig])],
  controllers: [TaxConfigController],
  providers: [TaxConfigService],
  exports: [TaxConfigService],
})
export class TaxConfigModule {}

