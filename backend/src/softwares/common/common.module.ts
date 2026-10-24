import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoreModule } from '../../core/core.module';
import { BusinessStructure } from './domain/entities/business-structure.entity';
import { BusinessStructureRepository } from './infrastructure/repositories/business-structure.repository';
import { BusinessStructureService } from './application/services/business-structure.service';
import { BusinessStructureController } from './presentation/controllers/business-structure.controller';

import { FiscalYear } from './domain/entities/fiscal-year.entity';
import { FiscalYearRepository } from './infrastructure/repositories/fiscal-year.repository';
import { FiscalYearService } from './application/services/fiscal-year.service';
import { FiscalYearController } from './presentation/controllers/fiscal-year.controller';

import { BaseSettings } from './domain/entities/base-settings.entity';
import { BaseSettingsRepository } from './infrastructure/repositories/base-settings.repository';
import { BaseSettingsService } from './application/services/base-settings.service';
import { BaseSettingsController } from './presentation/controllers/base-settings.controller';

import { Currency } from './domain/entities/currency.entity';
import { CurrencyRepository } from './infrastructure/repositories/currency.repository';
import { CurrencyService } from './application/services/currency.service';
import { CurrencyController } from './presentation/controllers/currency.controller';

import { GnrEntity } from './domain/entities/gnr-entity.entity';
import { GnrEntityService } from './application/services/gnr-entity.service';
import { GnrEntityController } from './presentation/controllers/gnr-entity.controller';
import { SeedInitializerService } from './application/services/seed-initializer.service';
import { SeedController } from './presentation/controllers/seed.controller';
import { AccountingModule } from '../accounting/accounting.module';

import { DetailedAccountsNumbering } from './domain/entities/detailed-accounts-numbering.entity';
import { DetailedAccountsNumberingRepository } from './infrastructure/repositories/detailed-accounts-numbering.repository';
import { DetailedAccountsNumberingService } from './application/services/detailed-accounts-numbering.service';
import { DetailedAccountsNumberingController } from './presentation/controllers/detailed-accounts-numbering.controller';
import { IDetailedAccountsNumberingRepositoryToken } from './domain/repositories/detailed-accounts-numbering.repository.interface';

import { EntityNumbering } from './domain/entities/entity-numbering.entity';
import { EntityNumberingRepository } from './infrastructure/repositories/entity-numbering.repository';
import { EntityNumberingService } from './application/services/entity-numbering.service';
import { EntityNumberingController } from './presentation/controllers/entity-numbering.controller';
import { IEntityNumberingRepositoryToken } from './domain/repositories/entity-numbering.repository.interface';

import { GeoLocation } from './domain/entities/geo-location.entity';
import { GeoLocationRepository } from './infrastructure/repositories/geo-location.repository';
import { GeoLocationService } from './application/services/geo-location.service';
import { GeoLocationController } from './presentation/controllers/geo-location.controller';
import { IGeoLocationRepository } from './domain/repositories/geo-location.repository.interface';

import { Party } from './domain/entities/party.entity';
import { PartyRelated } from './domain/entities/party-related.entity';
import { PartyAddress } from './domain/entities/party-address.entity';
import { PartyPhone } from './domain/entities/party-phone.entity';
import { PartyRepository } from './infrastructure/repositories/party.repository';
import { PartyService } from './application/services/party.service';
import { PartyController } from './presentation/controllers/party.controller';
import { IPartyRepositoryToken } from './domain/repositories/party.repository.interface';

import { CurrencyExchangeRate } from './domain/entities/currency-exchange-rate.entity';
import { CurrencyExchangeRateRepository } from './infrastructure/repositories/currency-exchange-rate.repository';
import { CurrencyExchangeRateService } from './application/services/currency-exchange-rate.service';
import { CurrencyExchangeRateController } from './presentation/controllers/currency-exchange-rate.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BusinessStructure, 
      FiscalYear, 
      BaseSettings, 
      Currency, 
      GnrEntity,
      DetailedAccountsNumbering,
      EntityNumbering,
      GeoLocation,
      Party,
      PartyRelated,
      PartyAddress,
      PartyPhone,
      CurrencyExchangeRate
    ]),
    CoreModule,
    forwardRef(() => AccountingModule),
  ],
  controllers: [
    BusinessStructureController, 
    FiscalYearController, 
    BaseSettingsController, 
    CurrencyController, 
    GnrEntityController,
    DetailedAccountsNumberingController,
    EntityNumberingController,
    GeoLocationController,
    PartyController,
    SeedController,
    CurrencyExchangeRateController
  ],
  providers: [
    {
      provide: 'IBusinessStructureRepository',
      useClass: BusinessStructureRepository,
    },
    {
      provide: 'IFiscalYearRepository',
      useClass: FiscalYearRepository,
    },
    {
      provide: 'IBaseSettingsRepository',
      useClass: BaseSettingsRepository,
    },
    {
      provide: 'ICurrencyRepository',
      useClass: CurrencyRepository,
    },
    {
      provide: IDetailedAccountsNumberingRepositoryToken,
      useClass: DetailedAccountsNumberingRepository,
    },
    {
      provide: IEntityNumberingRepositoryToken,
      useClass: EntityNumberingRepository,
    },
    {
      provide: IGeoLocationRepository,
      useClass: GeoLocationRepository,
    },
    {
      provide: IPartyRepositoryToken,
      useClass: PartyRepository,
    },
    {
      provide: 'ICurrencyExchangeRateRepository',
      useClass: CurrencyExchangeRateRepository,
    },
    BusinessStructureService,
    FiscalYearService,
    BaseSettingsService,
    CurrencyService,
    GnrEntityService,
    SeedInitializerService,
    DetailedAccountsNumberingService,
    EntityNumberingService,
    GeoLocationService,
    PartyService,
    CurrencyExchangeRateService,
  ],
  exports: [
    BusinessStructureService, 
    FiscalYearService, 
    BaseSettingsService, 
    CurrencyService, 
    GnrEntityService, 
    SeedInitializerService,
    DetailedAccountsNumberingService,
    EntityNumberingService,
    GeoLocationService,
    IDetailedAccountsNumberingRepositoryToken,
    IEntityNumberingRepositoryToken,
    PartyService,
    IPartyRepositoryToken,
    CurrencyExchangeRateService
  ],
})
export class CommonModule {}
