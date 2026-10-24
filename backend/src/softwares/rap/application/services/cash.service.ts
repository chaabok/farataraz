import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICashRepository, ICashRepositoryToken } from '../../domain/repositories/cash.repository.interface';
import { ICashierRepository, ICashierRepositoryToken } from '../../domain/repositories/cashier.repository.interface';
import { Cash } from '../../domain/entities/cash.entity';
import { Cashier } from '../../domain/entities/cashier.entity';
import { CreateCashDto } from '../dtos/create-cash.dto';
import { UpdateCashDto } from '../dtos/update-cash.dto';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class CashService {
  constructor(
    @Inject(ICashRepositoryToken)
    private readonly cashRepository: ICashRepository,
    @Inject(ICashierRepositoryToken)
    private readonly cashierRepository: ICashierRepository,
    private readonly detailedAccountService: DetailedAccountService,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly requestContextService: RequestContextService,
    private readonly idGenService: IdGenerationService,
  ) {}

  async create(createDto: CreateCashDto): Promise<Cash> {
    // 1. Generate detailed account
    // code '2' is "صندوق" in detailed types
    let detailedAccountId: number | null = null;
    
    // Find detailed type '2'
    const detailedTypes = await this.detailedTypeService.findAll();
    const typeCash = detailedTypes.find(t => t.code === '2');
    
    if (typeCash) {
      // Create detailed account based on provided code
      const newDa = await this.detailedAccountService.create({
        code: createDto.detailedAccountCode,
        title: createDto.title,
        title_en: createDto.title_en,
        detailedTypesId: typeCash.detailedTypesId,
        description: createDto.description,
        isActive: createDto.isActive ?? true,
      });
      detailedAccountId = newDa.detailedAccountId;
    }

    // 2. Create Cash
    const bsId = 1;
    const data: Partial<Cash> = {
      code: createDto.code,
      title: createDto.title,
      title_en: createDto.title_en,
      cashTypeId: createDto.cashTypeId || 1,
      currencyId: createDto.currencyId,
      initialBalance: createDto.initialBalance || 0,
      openingDate: createDto.openingDate,
      isActive: createDto.isActive ?? true,
      description: createDto.description,
      detailedAccountId: detailedAccountId,
    };

    const newCash = await this.cashRepository.create(data);

    // 3. Create Cashiers
    if (createDto.cashiers && createDto.cashiers.length > 0) {
      for (const userId of createDto.cashiers) {
        await this.cashierRepository.create({
          cashId: newCash.cashId,
          userId: userId,
        });
      }
    }

    return this.findOne(newCash.cashId);
  }

  async update(id: number, updateDto: UpdateCashDto): Promise<Cash> {
    const existing = await this.findOne(id);
    
    // Update Detailed Account Title and Code if changed
    if (existing.detailedAccountId && existing.detailedAccount) {
       await this.detailedAccountService.update(existing.detailedAccountId, {
           code: updateDto.detailedAccountCode,
           title: updateDto.title,
           title_en: updateDto.title_en,
           detailedTypesId: existing.detailedAccount.detailedTypesId,
           description: updateDto.description,
           isActive: updateDto.isActive ?? true,
       });
    }

    const data: Partial<Cash> = {
      code: updateDto.code,
      title: updateDto.title,
      title_en: updateDto.title_en,
      cashTypeId: updateDto.cashTypeId,
      // detailedAccountId stays the same since it's the FK
      currencyId: updateDto.currencyId,
      initialBalance: updateDto.initialBalance,
      openingDate: updateDto.openingDate,
      isActive: updateDto.isActive,
      description: updateDto.description,
    };

    await this.cashRepository.update(id, data);

    // Update Cashiers
    if (updateDto.cashiers !== undefined) {
      const existingCashiers = await this.cashierRepository.findByCashId(id);
      
      // Delete removed cashiers
      for (const ec of existingCashiers) {
        if (!updateDto.cashiers.includes(ec.userId)) {
          await this.cashierRepository.delete(ec.cashierId);
        }
      }
      
      // Add new cashiers
      const existingUserIds = existingCashiers.map(ec => ec.userId);
      for (const userId of updateDto.cashiers) {
        if (!existingUserIds.includes(userId)) {
          await this.cashierRepository.create({
            cashId: id,
            userId: userId,
          });
        }
      }
    }

    return this.findOne(id);
  }

  async findAll(): Promise<Cash[]> {
    return this.cashRepository.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: Cash[], total: number }> {
    const [items, total] = await this.cashRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<Cash> {
    const item = await this.cashRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Cash with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    
    // Delete related cashiers first to satisfy foreign key constraints
    const existingCashiers = await this.cashierRepository.findByCashId(id);
    for (const ec of existingCashiers) {
      await this.cashierRepository.delete(ec.cashierId);
    }
    
    const detailedAccountId = existing.detailedAccountId;
    
    // First delete cash to remove foreign key reference from cash to detailed account
    await this.cashRepository.delete(id);
    
    // Then delete the detailed account if it exists
    if (detailedAccountId) {
      try {
        await this.detailedAccountService.remove(detailedAccountId);
      } catch (e) {
        console.error('Failed to delete detailed account associated with cash:', e);
        // We might want to ignore this if the detailed account is used somewhere else
      }
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.cashRepository.checkDuplicate(field, value, excludeId);
  }
}
