import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CurrencyExchangeRate } from '../../domain/entities/currency-exchange-rate.entity';
import { ICurrencyExchangeRateRepository } from '../../domain/repositories/currency-exchange-rate.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { CreateCurrencyExchangeRateDto } from '../dtos/create-currency-exchange-rate.dto';
import { UpdateCurrencyExchangeRateDto } from '../dtos/update-currency-exchange-rate.dto';

@Injectable()
export class CurrencyExchangeRateService {
  constructor(
    @Inject('ICurrencyExchangeRateRepository')
    private readonly repo: ICurrencyExchangeRateRepository,
    private readonly idGenService: IdGenerationService,
  ) {}

  async findAll(businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate[]> {
    return this.repo.findAll(businessStructureRef, companyRef);
  }

  async findById(id: number, businessStructureRef: number, companyRef?: number): Promise<CurrencyExchangeRate> {
    const rate = await this.repo.findById(id, businessStructureRef, companyRef);
    if (!rate) {
      throw new NotFoundException('Currency Exchange Rate not found');
    }
    return rate;
  }

  async create(dto: CreateCurrencyExchangeRateDto, businessStructureRef: number, companyRef: number, userId: number): Promise<CurrencyExchangeRate> {
    const entity = new CurrencyExchangeRate();
    entity.currencyExchangeRateId = await this.idGenService.generateNextId('CurrencyExchangeRate');
    entity.baseCurrencyRef = dto.baseCurrencyRef;
    entity.targetCurrencyRef = dto.targetCurrencyRef;
    entity.effectiveDate = dto.effectiveDate;
    entity.exchangeRate = dto.exchangeRate;
    entity.businessStructureRef = businessStructureRef;
    entity.companyRef = companyRef;
    entity.creator = userId;
    entity.lastModifier = userId;

    return this.repo.create(entity);
  }

  async update(id: number, dto: UpdateCurrencyExchangeRateDto, businessStructureRef: number, companyRef: number, userId: number): Promise<CurrencyExchangeRate> {
    const entity = await this.findById(id, businessStructureRef, companyRef);
    
    if (dto.baseCurrencyRef !== undefined) entity.baseCurrencyRef = dto.baseCurrencyRef;
    if (dto.targetCurrencyRef !== undefined) entity.targetCurrencyRef = dto.targetCurrencyRef;
    if (dto.effectiveDate !== undefined) entity.effectiveDate = dto.effectiveDate;
    if (dto.exchangeRate !== undefined) entity.exchangeRate = dto.exchangeRate;
    
    entity.lastModifier = userId;

    return this.repo.update(entity);
  }

  async delete(id: number, businessStructureRef: number, companyRef?: number): Promise<void> {
    const entity = await this.findById(id, businessStructureRef, companyRef);
    await this.repo.delete(entity.currencyExchangeRateId);
  }
}
