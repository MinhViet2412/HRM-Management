import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsuranceConfigService } from './insurance-config.service';
import { InsuranceConfigController } from './insurance-config.controller';
import { InsuranceConfig } from '../database/entities/insurance-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InsuranceConfig])],
  controllers: [InsuranceConfigController],
  providers: [InsuranceConfigService],
  exports: [InsuranceConfigService],
})
export class InsuranceConfigModule {}

