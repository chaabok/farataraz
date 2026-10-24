"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyExchangeRate = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const currency_entity_1 = require("./currency.entity");
let CurrencyExchangeRate = class CurrencyExchangeRate extends app_base_entity_1.AppBaseEntity {
};
exports.CurrencyExchangeRate = CurrencyExchangeRate;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'CurrencyExchangeRateID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], CurrencyExchangeRate.prototype, "currencyExchangeRateId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        name: 'BaseCurrencyRef',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], CurrencyExchangeRate.prototype, "baseCurrencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'BaseCurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], CurrencyExchangeRate.prototype, "baseCurrencyEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'bigint',
        name: 'TargetCurrencyRef',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], CurrencyExchangeRate.prototype, "targetCurrencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'TargetCurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], CurrencyExchangeRate.prototype, "targetCurrencyEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', name: 'EffectiveDate' }),
    __metadata("design:type", String)
], CurrencyExchangeRate.prototype, "effectiveDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 18, scale: 6, name: 'ExchangeRate' }),
    __metadata("design:type", Number)
], CurrencyExchangeRate.prototype, "exchangeRate", void 0);
exports.CurrencyExchangeRate = CurrencyExchangeRate = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'CurrencyExchangeRate' })
], CurrencyExchangeRate);
//# sourceMappingURL=currency-exchange-rate.entity.js.map