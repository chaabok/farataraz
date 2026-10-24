import { Injectable, Inject } from '@nestjs/common';
import { IBankAccountRepository, IBankAccountRepositoryToken } from '../../domain/repositories/bank-account.repository.interface';
import { CreateBankAccountDto } from '../dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dtos/update-bank-account.dto';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import momentJalaali from 'moment-jalaali';

@Injectable()
export class BankAccountService {
  constructor(
    @Inject(IBankAccountRepositoryToken)
    private readonly bankAccountRepository: IBankAccountRepository,
    private readonly activityLogService: ActivityLogService,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService,
    private readonly detailedAccountService: DetailedAccountService,
  ) {}

  async create(createDto: CreateBankAccountDto): Promise<BankAccount> {
    const bankAccount = new BankAccount();
    Object.assign(bankAccount, createDto);

    // Clean empty string fields
    if (typeof bankAccount.latinTitle === 'string' && (!bankAccount.latinTitle.trim() || bankAccount.latinTitle === 'EMPTY_STRING')) {
      bankAccount.latinTitle = null as any;
    }
    if (typeof bankAccount.shabaNumber === 'string' && (!bankAccount.shabaNumber.trim() || bankAccount.shabaNumber === 'EMPTY_STRING')) {
      bankAccount.shabaNumber = null as any;
    }
    if (typeof bankAccount.accountHolderName === 'string' && (!bankAccount.accountHolderName.trim() || bankAccount.accountHolderName === 'EMPTY_STRING')) {
      bankAccount.accountHolderName = null as any;
    }

    if (createDto.openingDate !== undefined) {
      if (typeof createDto.openingDate === 'string' && createDto.openingDate.includes('/')) {
        bankAccount.openingDate = momentJalaali(createDto.openingDate, 'jYYYY/jMM/jDD').toDate();
      } else if (createDto.openingDate) {
        bankAccount.openingDate = new Date(createDto.openingDate);
      }
    }

    // Auto generate Detailed Code if missing & sync Detailed Account
    const types = await this.detailedTypeService.findAll();
    const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');

    if (bankDetailedType) {
      let codeToUse = bankAccount.detailedCode ? String(bankAccount.detailedCode) : null;
      if (!codeToUse) {
        codeToUse = await this.detailedAccountsNumberingService.getNextCode(bankDetailedType.detailedTypesId);
        bankAccount.detailedCode = parseInt(codeToUse, 10);
      }

      await this.syncDetailedAccount(
        codeToUse,
        bankAccount.title || `حساب بانکی ${bankAccount.accountNumber}`,
        bankAccount.latinTitle,
        bankDetailedType.detailedTypesId,
        bankAccount.isActive !== undefined ? bankAccount.isActive : true
      );
    }

    const created = await this.bankAccountRepository.create(bankAccount);
    this.activityLogService.logActionAsync({
      action: 'Create',
      entityName: 'Rap.BankAccounts',
      entityId: created.bankAccountId ? created.bankAccountId.toString() : '',
      newValues: created
    });
    return created;
  }

  async update(id: number, updateDto: UpdateBankAccountDto): Promise<BankAccount> {
    const data: Partial<BankAccount> = { ...(updateDto as any) };

    if (typeof data.latinTitle === 'string' && (!data.latinTitle.trim() || data.latinTitle === 'EMPTY_STRING')) {
      data.latinTitle = null as any;
    }
    if (typeof data.shabaNumber === 'string' && (!data.shabaNumber.trim() || data.shabaNumber === 'EMPTY_STRING')) {
      data.shabaNumber = null as any;
    }
    if (typeof data.accountHolderName === 'string' && (!data.accountHolderName.trim() || data.accountHolderName === 'EMPTY_STRING')) {
      data.accountHolderName = null as any;
    }

    if (updateDto.openingDate !== undefined) {
      if (typeof updateDto.openingDate === 'string' && updateDto.openingDate.includes('/')) {
        data.openingDate = momentJalaali(updateDto.openingDate, 'jYYYY/jMM/jDD').toDate();
      } else if (updateDto.openingDate) {
        data.openingDate = new Date(updateDto.openingDate);
      }
    }

    const updated = await this.bankAccountRepository.update(id, data);

    if (updated) {
      const types = await this.detailedTypeService.findAll();
      const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');
      if (bankDetailedType && updated.detailedCode) {
        await this.syncDetailedAccount(
          String(updated.detailedCode),
          updated.title,
          updated.latinTitle,
          bankDetailedType.detailedTypesId,
          updated.isActive !== undefined ? updated.isActive : true
        );
      }
    }

    this.activityLogService.logActionAsync({
      action: 'Update',
      entityName: 'Rap.BankAccounts',
      entityId: id.toString(),
      newValues: updated
    });
    return updated;
  }

  async delete(id: number): Promise<void> {
    const existing = await this.bankAccountRepository.findById(id);
    await this.bankAccountRepository.delete(id);

    if (existing && existing.detailedCode) {
      try {
        const types = await this.detailedTypeService.findAll();
        const bankDetailedType = types.find(t => t.code === '1' || t.title === 'حساب بانکی');
        if (bankDetailedType) {
          const allDAs = await this.detailedAccountService.findAll();
          const existingDA = allDAs.find(
            da => (da.detailedTypesId === bankDetailedType.detailedTypesId || da.detailedType?.code === '1') &&
                  String(da.code) === String(existing.detailedCode)
          );
          if (existingDA) {
            await this.detailedAccountService.remove(existingDA.detailedAccountId);
          }
        }
      } catch (e) {
        console.error('Failed to delete associated detailed account for bank account:', e);
      }
    }

    this.activityLogService.logActionAsync({
      action: 'Delete',
      entityName: 'Rap.BankAccounts',
      entityId: id.toString()
    });
  }

  private async syncDetailedAccount(code: string, title: string, titleEn: string | null, detailedTypesId: number, isActive: boolean) {
    try {
      const allDAs = await this.detailedAccountService.findAll();
      const existingDA = allDAs.find(
        da => (da.detailedTypesId === detailedTypesId || da.detailedType?.code === '1') &&
              String(da.code) === String(code)
      );

      if (!existingDA) {
        await this.detailedAccountService.create({
          code: code,
          title: title,
          title_en: titleEn || undefined,
          detailedTypesId: detailedTypesId,
          isActive: isActive,
        });
      } else {
        await this.detailedAccountService.update(existingDA.detailedAccountId, {
          title: title,
          title_en: titleEn || undefined,
          isActive: isActive,
        });
      }
    } catch (err) {
      console.error('Failed to sync detailed account for bank account:', err);
    }
  }

  async findById(id: number): Promise<BankAccount> {
    return this.bankAccountRepository.findById(id) as Promise<BankAccount>;
  }

  async findAll(options?: any): Promise<{items: BankAccount[], total: number}> {
    return this.bankAccountRepository.findAll(options);
  }
}
