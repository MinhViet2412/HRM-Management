import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractType } from '../entities/contract-type.entity';

@Injectable()
export class ContractTypeSeeder {
  constructor(
    @InjectRepository(ContractType)
    private readonly repo: Repository<ContractType>,
  ) {}

  async run() {
    console.log('ContractTypeSeeder: Starting...');
    const defaults: Array<Partial<ContractType>> = [
      { 
        name: 'Chính thức', 
        description: 'Hợp đồng lao động chính thức không xác định thời hạn', 
        standardTermMonths: null, 
        probationMonths: 0 
      },
      { 
        name: 'Thử việc', 
        description: 'Hợp đồng thử việc', 
        standardTermMonths: 2, 
        probationMonths: 0 
      },
      { 
        name: 'Không thời hạn', 
        description: 'Hợp đồng lao động không xác định thời hạn', 
        standardTermMonths: null, 
        probationMonths: 2 
      },
      { 
        name: 'Xác định thời hạn 12 tháng', 
        description: 'Hợp đồng 12 tháng', 
        standardTermMonths: 12, 
        probationMonths: 2 
      },
      { 
        name: 'Xác định thời hạn 24 tháng', 
        description: 'Hợp đồng 24 tháng', 
        standardTermMonths: 24, 
        probationMonths: 2 
      },
    ];

    console.log(`ContractTypeSeeder: Processing ${defaults.length} contract types...`);
    for (const def of defaults) {
      console.log(`ContractTypeSeeder: Checking ${def.name}...`);
      const exists = await this.repo.findOne({ where: { name: def.name } });
      if (!exists) {
        console.log(`ContractTypeSeeder: Creating ${def.name}...`);
        await this.repo.save(this.repo.create(def));
        console.log(`Created contract type: ${def.name}`);
      } else {
        console.log(`Contract type already exists: ${def.name}`);
      }
    }
    console.log('ContractTypeSeeder: Completed!');
  }
}


