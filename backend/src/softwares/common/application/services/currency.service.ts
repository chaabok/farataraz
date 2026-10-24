import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ICurrencyRepository } from '../../domain/repositories/currency.repository.interface';
import { CreateCurrencyDto } from '../dtos/create-currency.dto';
import { UpdateCurrencyDto } from '../dtos/update-currency.dto';
import { Currency } from '../../domain/entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @Inject('ICurrencyRepository')
    private readonly repository: ICurrencyRepository,
  ) {}

  async create(dto: CreateCurrencyDto, businessStructureRef: number = 2, branchRef?: number, agencyRef?: number): Promise<Currency> {
    // Check uniqueness
    if (dto.code) {
      const existingCode = await this.repository.findByCode(dto.code, businessStructureRef);
      if (existingCode) throw new ConflictException('تکراری: کُد وارد شده قبلاً ثبت شده است.');
    }

    const existingTitle = await this.repository.findByTitle(dto.title, businessStructureRef);
    if (existingTitle) throw new ConflictException('تکراری: این عنوان قبلاً ثبت شده است.');

    const existingTitleEn = await this.repository.findByTitleEn(dto.titleEn, businessStructureRef);
    if (existingTitleEn) throw new ConflictException('تکراری: این عنوان لاتین قبلاً ثبت شده است.');

    let finalCode = dto.code;
    if (!finalCode) {
      const maxCode = await this.repository.getMaxCode(businessStructureRef);
      finalCode = maxCode + 1;
    }

    const currency = new Currency();
    currency.code = finalCode;
    currency.title = dto.title;
    currency.titleEn = dto.titleEn;
    currency.exchangeUnit = dto.exchangeUnit;
    currency.precisionCount = dto.precisionCount;
    currency.precisionTitle = dto.precisionTitle;
    currency.precisionTitleEn = dto.precisionTitleEn;
    currency.isActive = dto.isActive !== undefined ? dto.isActive : true;
    currency.businessStructureRef = businessStructureRef;
    currency.companyRef = businessStructureRef;
    if (branchRef) currency.branchRef = branchRef;
    if (agencyRef) currency.agencyRef = agencyRef;

    return this.repository.create(currency);
  }

  async findAll(): Promise<Currency[]> {
    return this.repository.findAll();
  }

  async findOne(id: number): Promise<Currency> {
    const currency = await this.repository.findById(id);
    if (!currency) throw new NotFoundException('ارز مورد نظر یافت نشد.');
    return currency;
  }

  async update(id: number, dto: UpdateCurrencyDto, businessStructureRef: number = 2, branchRef?: number, agencyRef?: number): Promise<Currency> {
    const currency = await this.findOne(id);

    if (dto.code && dto.code !== currency.code) {
      const existing = await this.repository.findByCode(dto.code, businessStructureRef);
      if (existing && existing.currencyID !== id) throw new ConflictException('تکراری: کُد وارد شده قبلاً ثبت شده است.');
    }
    if (dto.title && dto.title !== currency.title) {
      const existing = await this.repository.findByTitle(dto.title, businessStructureRef);
      if (existing && existing.currencyID !== id) throw new ConflictException('تکراری: این عنوان قبلاً ثبت شده است.');
    }
    if (dto.titleEn && dto.titleEn !== currency.titleEn) {
      const existing = await this.repository.findByTitleEn(dto.titleEn, businessStructureRef);
      if (existing && existing.currencyID !== id) throw new ConflictException('تکراری: این عنوان لاتین قبلاً ثبت شده است.');
    }

    const updateData: any = { ...dto, businessStructureRef, companyRef: businessStructureRef };
    if (branchRef !== undefined) updateData.branchRef = branchRef;
    if (agencyRef !== undefined) updateData.agencyRef = agencyRef;

    return this.repository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  async getNextCode(businessStructureRef: number = 2): Promise<number> {
    const maxCode = await this.repository.getMaxCode(businessStructureRef);
    return maxCode + 1;
  }

  async seedForBusinessStructure(businessStructureId: number): Promise<void> {
    const defaultCurrencies = [
      { code: 1, title: 'ریال ایران', titleEn: 'Iranian Rial', exchangeUnit: 1, precisionCount: 0, precisionTitle: 'دینار', precisionTitleEn: 'Dinar' },
      { code: 2, title: 'دلار آمریکا', titleEn: 'US Dollar', exchangeUnit: 1, precisionCount: 2, precisionTitle: 'سنت', precisionTitleEn: 'Cent' },
    ];

    let resolvedBSRef = businessStructureId;
    let isShared = true;
    try {
      const structures = await (this.repository as any).typeOrmRepo.manager.query(
        `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [businessStructureId]
      );
      if (structures && structures.length > 0) {
        const bs = structures.find((r: any) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === businessStructureId) || structures[0];
        const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
        const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
        if (bsType === 2 && parentRef > 0) {
          resolvedBSRef = parentRef;
        }
        if (structures.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (e) {
      isShared = false;
    }

    const checkBSRef = isShared ? resolvedBSRef : businessStructureId;

    for (const cur of defaultCurrencies) {
      try {
        await this.create(cur as any, businessStructureId);
      } catch (e: any) {
        // Suppress errors during seed
      }
    }
  }
}
