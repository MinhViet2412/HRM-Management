import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractTemplate } from '../entities/contract-template.entity';
import { ContractType } from '../entities/contract-type.entity';

@Injectable()
export class ContractTemplateSeeder {
  constructor(
    @InjectRepository(ContractTemplate)
    private readonly templateRepo: Repository<ContractTemplate>,
    @InjectRepository(ContractType)
    private readonly typeRepo: Repository<ContractType>,
  ) {}

  async run() {
    const defaultTemplates = [
      {
        name: 'Mẫu HĐLĐ cơ bản',
        content:
          'HỢP ĐỒNG LAO ĐỘNG\n\nBên A: {{companyName}}\nBên B: {{employeeFullName}}\nChức danh: {{position}}\nMức lương cơ bản: {{baseSalary}}\nPhụ cấp: {{allowance}}\nThưởng: {{bonus}}\nThời hạn: {{termMonths}} tháng\nNgày bắt đầu: {{startDate}}\nNgày kết thúc: {{endDate}}',
      },
    ];

    for (const t of defaultTemplates) {
      const exists = await this.templateRepo.findOne({ where: { name: t.name } });
      if (!exists) {
        await this.templateRepo.save(this.templateRepo.create(t));
        console.log(`Created contract template: ${t.name}`);
      }
    }
  }
}


