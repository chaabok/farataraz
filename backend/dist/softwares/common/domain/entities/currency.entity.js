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
exports.Currency = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let Currency = class Currency extends app_base_entity_1.AppBaseEntity {
};
exports.Currency = Currency;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'CurrencyID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Currency.prototype, "currencyID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'Code' }),
    __metadata("design:type", Number)
], Currency.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'Title' }),
    __metadata("design:type", String)
], Currency.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'Title_En' }),
    __metadata("design:type", String)
], Currency.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'ExchangeUnit' }),
    __metadata("design:type", Number)
], Currency.prototype, "exchangeUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'PrecisionCount' }),
    __metadata("design:type", Number)
], Currency.prototype, "precisionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'PrecisionTitle', nullable: true }),
    __metadata("design:type", String)
], Currency.prototype, "precisionTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'PrecisionTitle_En', nullable: true }),
    __metadata("design:type", String)
], Currency.prototype, "precisionTitleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'IsActive', default: true }),
    __metadata("design:type", Boolean)
], Currency.prototype, "isActive", void 0);
exports.Currency = Currency = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'Currency' }),
    (0, typeorm_1.Index)(['code', 'businessStructureRef'], { unique: true }),
    (0, typeorm_1.Index)(['title', 'businessStructureRef'], { unique: true }),
    (0, typeorm_1.Index)(['titleEn', 'businessStructureRef'], { unique: true }),
    (0, typeorm_1.Check)('"ExchangeUnit" > 0'),
    (0, typeorm_1.Check)('"PrecisionCount" >= 0')
], Currency);
//# sourceMappingURL=currency.entity.js.map