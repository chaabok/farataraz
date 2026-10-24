import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurrencyExchangeRate } from '../../domain/entities/currency-exchange-rate.entity';
import { ICurrencyExchangeRateRepository } from '../../domain/repositories/currency-exchange-rate.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class CurrencyExchangeRateRepository implements ICurrencyExchangeRateRepository {
  constructor(
    @InjectRepository(CurrencyExchangeRate)
    private readonly repo: Repository<CurrencyExchangeRate>,
    private readonly idGenService: IdGenerationService,
  ) {}

  private async isBasicShared(businessStructureId: number): Promise<boolean> {
    try {
      const rows = await this.repo.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [businessStructureId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          return false;
        }
        return true;
      }
    } catch (err) {}
    return false;
  }

  async findAll(businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate[]> {
    const isShared = await this.isBasicShared(businessStructureRef);
    const qb = this.repo.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.baseCurrencyEntity', 'baseCurrency')
      .leftJoinAndSelect('rate.targetCurrencyEntity', 'targetCurrency');
      
    if (isShared) {
      qb.where('rate.businessStructureRef = :businessStructureRef', { businessStructureRef });
    } else {
      qb.where('rate.companyRef = :companyRef', { companyRef: companyRef ?? businessStructureRef });
    }

    return qb.getMany();
  }

  async findById(id: number, businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate | null> {
    const isShared = await this.isBasicShared(businessStructureRef);
    const qb = this.repo.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.baseCurrencyEntity', 'baseCurrency')
      .leftJoinAndSelect('rate.targetCurrencyEntity', 'targetCurrency')
      .where('rate.currencyExchangeRateId = :id', { id });
      
    if (isShared) {
      qb.andWhere('rate.businessStructureRef = :businessStructureRef', { businessStructureRef });
    } else {
      qb.andWhere('rate.companyRef = :companyRef', { companyRef: companyRef ?? businessStructureRef });
    }

    return qb.getOne();
  }

  async create(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate> {
    if (!entity.currencyExchangeRateId) {
      entity.currencyExchangeRateId = await this.idGenService.generateNextId('CurrencyExchangeRate');
    }
    return this.repo.save(entity);
  }

  async update(entity: CurrencyExchangeRate): Promise<CurrencyExchangeRate> {
    return this.repo.save(entity);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete({ currencyExchangeRateId: id });
  }
}
