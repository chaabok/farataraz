"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const core_module_1 = require("../../core/core.module");
const business_structure_entity_1 = require("./domain/entities/business-structure.entity");
const business_structure_repository_1 = require("./infrastructure/repositories/business-structure.repository");
const business_structure_service_1 = require("./application/services/business-structure.service");
const business_structure_controller_1 = require("./presentation/controllers/business-structure.controller");
const fiscal_year_entity_1 = require("./domain/entities/fiscal-year.entity");
const fiscal_year_repository_1 = require("./infrastructure/repositories/fiscal-year.repository");
const fiscal_year_service_1 = require("./application/services/fiscal-year.service");
const fiscal_year_controller_1 = require("./presentation/controllers/fiscal-year.controller");
const base_settings_entity_1 = require("./domain/entities/base-settings.entity");
const base_settings_repository_1 = require("./infrastructure/repositories/base-settings.repository");
const base_settings_service_1 = require("./application/services/base-settings.service");
const base_settings_controller_1 = require("./presentation/controllers/base-settings.controller");
const currency_entity_1 = require("./domain/entities/currency.entity");
const currency_repository_1 = require("./infrastructure/repositories/currency.repository");
const currency_service_1 = require("./application/services/currency.service");
const currency_controller_1 = require("./presentation/controllers/currency.controller");
const gnr_entity_entity_1 = require("./domain/entities/gnr-entity.entity");
const gnr_entity_service_1 = require("./application/services/gnr-entity.service");
const gnr_entity_controller_1 = require("./presentation/controllers/gnr-entity.controller");
const seed_initializer_service_1 = require("./application/services/seed-initializer.service");
const seed_controller_1 = require("./presentation/controllers/seed.controller");
const accounting_module_1 = require("../accounting/accounting.module");
const detailed_accounts_numbering_entity_1 = require("./domain/entities/detailed-accounts-numbering.entity");
const detailed_accounts_numbering_repository_1 = require("./infrastructure/repositories/detailed-accounts-numbering.repository");
const detailed_accounts_numbering_service_1 = require("./application/services/detailed-accounts-numbering.service");
const detailed_accounts_numbering_controller_1 = require("./presentation/controllers/detailed-accounts-numbering.controller");
const detailed_accounts_numbering_repository_interface_1 = require("./domain/repositories/detailed-accounts-numbering.repository.interface");
const entity_numbering_entity_1 = require("./domain/entities/entity-numbering.entity");
const entity_numbering_repository_1 = require("./infrastructure/repositories/entity-numbering.repository");
const entity_numbering_service_1 = require("./application/services/entity-numbering.service");
const entity_numbering_controller_1 = require("./presentation/controllers/entity-numbering.controller");
const entity_numbering_repository_interface_1 = require("./domain/repositories/entity-numbering.repository.interface");
const geo_location_entity_1 = require("./domain/entities/geo-location.entity");
const geo_location_repository_1 = require("./infrastructure/repositories/geo-location.repository");
const geo_location_service_1 = require("./application/services/geo-location.service");
const geo_location_controller_1 = require("./presentation/controllers/geo-location.controller");
const geo_location_repository_interface_1 = require("./domain/repositories/geo-location.repository.interface");
const party_entity_1 = require("./domain/entities/party.entity");
const party_related_entity_1 = require("./domain/entities/party-related.entity");
const party_address_entity_1 = require("./domain/entities/party-address.entity");
const party_phone_entity_1 = require("./domain/entities/party-phone.entity");
const party_repository_1 = require("./infrastructure/repositories/party.repository");
const party_service_1 = require("./application/services/party.service");
const party_controller_1 = require("./presentation/controllers/party.controller");
const party_repository_interface_1 = require("./domain/repositories/party.repository.interface");
const currency_exchange_rate_entity_1 = require("./domain/entities/currency-exchange-rate.entity");
const currency_exchange_rate_repository_1 = require("./infrastructure/repositories/currency-exchange-rate.repository");
const currency_exchange_rate_service_1 = require("./application/services/currency-exchange-rate.service");
const currency_exchange_rate_controller_1 = require("./presentation/controllers/currency-exchange-rate.controller");
let CommonModule = class CommonModule {
};
exports.CommonModule = CommonModule;
exports.CommonModule = CommonModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                business_structure_entity_1.BusinessStructure,
                fiscal_year_entity_1.FiscalYear,
                base_settings_entity_1.BaseSettings,
                currency_entity_1.Currency,
                gnr_entity_entity_1.GnrEntity,
                detailed_accounts_numbering_entity_1.DetailedAccountsNumbering,
                entity_numbering_entity_1.EntityNumbering,
                geo_location_entity_1.GeoLocation,
                party_entity_1.Party,
                party_related_entity_1.PartyRelated,
                party_address_entity_1.PartyAddress,
                party_phone_entity_1.PartyPhone,
                currency_exchange_rate_entity_1.CurrencyExchangeRate
            ]),
            core_module_1.CoreModule,
            (0, common_1.forwardRef)(() => accounting_module_1.AccountingModule),
        ],
        controllers: [
            business_structure_controller_1.BusinessStructureController,
            fiscal_year_controller_1.FiscalYearController,
            base_settings_controller_1.BaseSettingsController,
            currency_controller_1.CurrencyController,
            gnr_entity_controller_1.GnrEntityController,
            detailed_accounts_numbering_controller_1.DetailedAccountsNumberingController,
            entity_numbering_controller_1.EntityNumberingController,
            geo_location_controller_1.GeoLocationController,
            party_controller_1.PartyController,
            seed_controller_1.SeedController,
            currency_exchange_rate_controller_1.CurrencyExchangeRateController
        ],
        providers: [
            {
                provide: 'IBusinessStructureRepository',
                useClass: business_structure_repository_1.BusinessStructureRepository,
            },
            {
                provide: 'IFiscalYearRepository',
                useClass: fiscal_year_repository_1.FiscalYearRepository,
            },
            {
                provide: 'IBaseSettingsRepository',
                useClass: base_settings_repository_1.BaseSettingsRepository,
            },
            {
                provide: 'ICurrencyRepository',
                useClass: currency_repository_1.CurrencyRepository,
            },
            {
                provide: detailed_accounts_numbering_repository_interface_1.IDetailedAccountsNumberingRepositoryToken,
                useClass: detailed_accounts_numbering_repository_1.DetailedAccountsNumberingRepository,
            },
            {
                provide: entity_numbering_repository_interface_1.IEntityNumberingRepositoryToken,
                useClass: entity_numbering_repository_1.EntityNumberingRepository,
            },
            {
                provide: geo_location_repository_interface_1.IGeoLocationRepository,
                useClass: geo_location_repository_1.GeoLocationRepository,
            },
            {
                provide: party_repository_interface_1.IPartyRepositoryToken,
                useClass: party_repository_1.PartyRepository,
            },
            {
                provide: 'ICurrencyExchangeRateRepository',
                useClass: currency_exchange_rate_repository_1.CurrencyExchangeRateRepository,
            },
            business_structure_service_1.BusinessStructureService,
            fiscal_year_service_1.FiscalYearService,
            base_settings_service_1.BaseSettingsService,
            currency_service_1.CurrencyService,
            gnr_entity_service_1.GnrEntityService,
            seed_initializer_service_1.SeedInitializerService,
            detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
            entity_numbering_service_1.EntityNumberingService,
            geo_location_service_1.GeoLocationService,
            party_service_1.PartyService,
            currency_exchange_rate_service_1.CurrencyExchangeRateService,
        ],
        exports: [
            business_structure_service_1.BusinessStructureService,
            fiscal_year_service_1.FiscalYearService,
            base_settings_service_1.BaseSettingsService,
            currency_service_1.CurrencyService,
            gnr_entity_service_1.GnrEntityService,
            seed_initializer_service_1.SeedInitializerService,
            detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
            entity_numbering_service_1.EntityNumberingService,
            geo_location_service_1.GeoLocationService,
            detailed_accounts_numbering_repository_interface_1.IDetailedAccountsNumberingRepositoryToken,
            entity_numbering_repository_interface_1.IEntityNumberingRepositoryToken,
            party_service_1.PartyService,
            party_repository_interface_1.IPartyRepositoryToken,
            currency_exchange_rate_service_1.CurrencyExchangeRateService
        ],
    })
], CommonModule);
//# sourceMappingURL=common.module.js.map