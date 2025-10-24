import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ResignationsService } from './resignations.service';

@Injectable()
export class ResignationsProcessor {
  private readonly logger = new Logger(ResignationsProcessor.name)

  constructor(private readonly service: ResignationsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async handleCron() {
    const res = await this.service.processEffectiveResignations()
    if (res.processed) this.logger.log(`Processed ${res.processed} resignation(s)`) 
  }
}


