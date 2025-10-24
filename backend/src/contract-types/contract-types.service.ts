import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContractType } from '../database/entities/contract-type.entity';
import { CreateContractTypeDto, UpdateContractTypeDto } from './dto';

@Injectable()
export class ContractTypesService {
  constructor(
    @InjectRepository(ContractType)
    private readonly contractTypeRepository: Repository<ContractType>,
  ) {}

  async create(createContractTypeDto: CreateContractTypeDto): Promise<ContractType> {
    const contractType = this.contractTypeRepository.create(createContractTypeDto);
    return this.contractTypeRepository.save(contractType);
  }

  async findAll(): Promise<ContractType[]> {
    return this.contractTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ContractType> {
    const contractType = await this.contractTypeRepository.findOne({
      where: { id },
    });

    if (!contractType) {
      throw new NotFoundException('Contract type not found');
    }

    return contractType;
  }

  async update(id: string, updateContractTypeDto: UpdateContractTypeDto): Promise<ContractType> {
    const contractType = await this.findOne(id);
    
    Object.assign(contractType, updateContractTypeDto);
    return this.contractTypeRepository.save(contractType);
  }

  async remove(id: string): Promise<void> {
    const contractType = await this.findOne(id);
    await this.contractTypeRepository.remove(contractType);
  }

  async findByName(name: string): Promise<ContractType | null> {
    return this.contractTypeRepository.findOne({
      where: { name },
    });
  }
}
