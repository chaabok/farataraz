import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../domain/entities/currency.entity';
import { ICurrencyRepository } from '../../domain/repositories/currency.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class CurrencyRepository implements ICurrencyRepository {
  constructor(
    @InjectRepository(Currency)
    private readonly typeOrmRepo: Repository<Currency>,
    private readonly requestContextService: RequestContextService,
    private readonly idGenService: IdGenerationService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.typeOrmRepo.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async create(currency: Currency): Promise<Currency> {
    const { bsId, compId } = await this.getScope();
    if (!currency.currencyID) {
      currency.currencyID = await this.idGenService.generateNextId('Currency');
    }
    if (!currency.businessStructureRef || currency.businessStructureRef <= 1) {
      currency.businessStructureRef = bsId;
    }
    if (!currency.companyRef || currency.companyRef <= 1) {
      currency.companyRef = compId;
    }
    const newCurrency = this.typeOrmRepo.create(currency);
    return this.typeOrmRepo.save(newCurrency);
  }

  async update(id: number, currency: Partial<Currency>): Promise<Currency> {
    await this.typeOrmRepo.update(id, currency);
    return this.findById(id) as Promise<Currency>;
  }

  async findById(id: number): Promise<Currency | null> {
    return this.typeOrmRepo.findOne({ where: { currencyID: id } });
  }

  async findAll(): Promise<Currency[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.typeOrmRepo.find({ where, order: { code: 'ASC' } });
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async getMaxCode(businessStructureRef: number): Promise<number> {
    const { bsId, compId, isShared } = await this.getScope();
    const whereCol = isShared ? 'currency.businessStructureRef' : 'currency.companyRef';
    const whereVal = isShared ? bsId : compId;
    const result = await this.typeOrmRepo
      .createQueryBuilder('currency')
      .select('MAX(currency.code)', 'max')
      .where(`${whereCol} = :val`, { val: whereVal })
      .getRawOne();
      
    return result?.max ? parseInt(result.max, 10) : 0;
  }

  async findByTitle(title: string, businessStructureRef: number): Promise<Currency | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { title };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({ where });
  }

  async findByTitleEn(titleEn: string, businessStructureRef: number): Promise<Currency | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { titleEn };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({ where });
  }

  async findByCode(code: number, businessStructureRef: number): Promise<Currency | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { code };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({ where });
  }
}
