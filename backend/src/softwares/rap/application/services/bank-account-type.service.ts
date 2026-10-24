import { Injectable, Inject, NotFoundException, OnModuleInit } from '@nestjs/common';
import { IBankAccountTypeRepository, IBankAccountTypeRepositoryToken } from '../../domain/repositories/bank-account-type.repository.interface';
import { BankAccountType } from '../../domain/entities/bank-account-type.entity';
import { CreateBankAccountTypeDto } from '../dtos/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from '../dtos/update-bank-account-type.dto';

@Injectable()
export class BankAccountTypeService implements OnModuleInit {
  constructor(
    @Inject(IBankAccountTypeRepositoryToken)
    private readonly repository: IBankAccountTypeRepository,
  ) {}

  async onModuleInit() {
    if (process.env.SYNC_DB === 'true') {
      try {
        await this.seedDefaults();
      } catch (e) {
        console.error('Failed to seed bank account types', e);
      }
    }
  }

  private async seedDefaults() {
    const count = await this.repository.count();
    if (count === 0) {
      const defaults = [
        { code: 1, title: 'حساب جاری', latinTitle: 'Current Account' },
        { code: 2, title: 'قرض الحسنه', latinTitle: 'Qard al-Hasan' },
        { code: 3, title: 'سپرده کوتاه مدت', latinTitle: 'Short-term deposit' },
        { code: 4, title: 'سپرده بلندمدت', latinTitle: 'Long-term deposit' },
        { code: 5, title: 'سایر', latinTitle: 'Other' },
      ];

      for (const item of defaults) {
        const dto: CreateBankAccountTypeDto = {
          code: item.code,
          title: item.title,
          latinTitle: item.latinTitle,
          isActive: true
        };
        await this.create(dto);
      }
    }
  }

  async findAll(): Promise<BankAccountType[]> {
    return await this.repository.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: BankAccountType[], total: number }> {
    const [items, total] = await this.repository.findAdvanced(params);
    return { items, total };
  }

  async findById(id: number): Promise<BankAccountType> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`BankAccountType with ID ${id} not found`);
    }
    return entity;
  }

  async create(dto: CreateBankAccountTypeDto): Promise<BankAccountType> {
    const bat = new BankAccountType();
    
    // Auto increment ID if not provided
    if (!dto.bankAccountTypeId) {
        const maxId = await this.repository.getMaxId();
        bat.bankAccountTypeId = maxId + 1;
    } else {
        bat.bankAccountTypeId = dto.bankAccountTypeId;
    }

    bat.code = dto.code;
    bat.title = dto.title;
    if (dto.latinTitle !== undefined) bat.latinTitle = dto.latinTitle;
    if (dto.isActive !== undefined) bat.isActive = dto.isActive;

    return await this.repository.create(bat);
  }

  async update(id: number, dto: UpdateBankAccountTypeDto): Promise<BankAccountType> {
    const existing = await this.findById(id);
    
    if (dto.code !== undefined) existing.code = dto.code;
    if (dto.title !== undefined) existing.title = dto.title;
    if (dto.latinTitle !== undefined) existing.latinTitle = dto.latinTitle;
    if (dto.isActive !== undefined) existing.isActive = dto.isActive;

    return await this.repository.update(id, existing);
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
