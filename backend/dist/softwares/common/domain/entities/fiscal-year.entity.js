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
exports.FiscalYear = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let FiscalYear = class FiscalYear extends app_base_entity_1.AppBaseEntity {
};
exports.FiscalYear = FiscalYear;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'FiscalYearID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], FiscalYear.prototype, "fiscalYearID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: false, name: 'Title' }),
    __metadata("design:type", String)
], FiscalYear.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        name: 'StartDate',
        transformer: {
            to: (value) => value,
            from: (value) => {
                if (!value)
                    return value;
                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }
                if (typeof value === 'string') {
                    return value.split('T')[0];
                }
                return value;
            }
        }
    }),
    __metadata("design:type", Object)
], FiscalYear.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'date',
        nullable: false,
        name: 'EndDate',
        transformer: {
            to: (value) => value,
            from: (value) => {
                if (!value)
                    return value;
                if (value instanceof Date) {
                    return value.toISOString().split('T')[0];
                }
                if (typeof value === 'string') {
                    return value.split('T')[0];
                }
                return value;
            }
        }
    }),
    __metadata("design:type", Object)
], FiscalYear.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', nullable: false, default: true, name: 'IsActive' }),
    __metadata("design:type", Boolean)
], FiscalYear.prototype, "isActive", void 0);
exports.FiscalYear = FiscalYear = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'FiscalYear' }),
    (0, typeorm_1.Check)('"EndDate" >= "StartDate"')
], FiscalYear);
//# sourceMappingURL=fiscal-year.entity.js.map