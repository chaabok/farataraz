import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { IBankRepository, IBankRepositoryToken } from '../../domain/repositories/bank.repository.interface';
import { Bank } from '../../domain/entities/bank.entity';
import { CreateBankDto } from '../dtos/create-bank.dto';
import { UpdateBankDto } from '../dtos/update-bank.dto';

@Injectable()
export class BankService {
  constructor(
    @Inject(IBankRepositoryToken)
    private readonly bankRepository: IBankRepository,
  ) {}

  async create(createDto: CreateBankDto): Promise<Bank> {
    await this.validateDuplicates(createDto);
    return this.bankRepository.create(createDto);
  }

  async update(id: number, updateDto: UpdateBankDto): Promise<Bank> {
    const existing = await this.findOne(id);
    await this.validateDuplicates(updateDto, id);
    await this.bankRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async findAll(): Promise<Bank[]> {
    return this.bankRepository.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: Bank[], total: number }> {
    const [items, total] = await this.bankRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<Bank> {
    const item = await this.bankRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Bank with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.bankRepository.delete(id);
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.bankRepository.checkDuplicate(field, value, excludeId);
  }

  private async validateDuplicates(dto: Partial<CreateBankDto | UpdateBankDto>, excludeId?: number) {
    if (dto.code !== undefined) {
      const isDuplicateCode = await this.checkDuplicate('code', dto.code, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد بانک تکراری است');
      }
    }
    
    if (dto.title !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('title', dto.title, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان بانک تکراری است');
      }
    }
    
    if (dto.latinTitle !== undefined && dto.latinTitle !== null && dto.latinTitle !== '') {
      const isDuplicateLatinTitle = await this.checkDuplicate('latinTitle', dto.latinTitle, excludeId);
      if (isDuplicateLatinTitle) {
        throw new BadRequestException('عنوان لاتین بانک تکراری است');
      }
    }
  }
}
