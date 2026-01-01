import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveLimitConfigService } from './leave-limit-config.service';
import { LeaveLimitConfigController } from './leave-limit-config.controller';
import { LeaveLimitConfig } from '../database/entities/leave-limit-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LeaveLimitConfig])],
  controllers: [LeaveLimitConfigController],
  providers: [LeaveLimitConfigService],
  exports: [LeaveLimitConfigService],
})
export class LeaveLimitConfigModule {}

