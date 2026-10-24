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
exports.Party = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const party_related_entity_1 = require("./party-related.entity");
const party_address_entity_1 = require("./party-address.entity");
const party_phone_entity_1 = require("./party-phone.entity");
let Party = class Party extends app_base_entity_1.AppBaseEntity {
};
exports.Party = Party;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PartyID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Party.prototype, "partyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Nature', type: 'varchar', length: 50, nullable: false, default: 'real_person' }),
    __metadata("design:type", String)
], Party.prototype, "nature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Party.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SubType', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "subType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Website', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EmailAddress', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FirstName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinFirstName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "latinFirstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LastName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinLastName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "latinLastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountID', type: 'bigint', nullable: true, unique: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Party.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => detailed_account_entity_1.DetailedAccount, { eager: true, cascade: false, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], Party.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EconomicCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "economicCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NationalCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "nationalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PassportNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "passportNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BirthDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Party.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MarriageDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Party.prototype, "marriageDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NationalId', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RegistrationNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsSupplier', type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Party.prototype, "isSupplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Balance', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BalanceStatus', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "balanceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsCustomer', type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Party.prototype, "isCustomer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CustomerBalance', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "customerBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CustomerBalanceStatus', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "customerBalanceStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsSalesIntermediary', type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], Party.prototype, "isSalesIntermediary", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SalesIntermediaryBalance', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "salesIntermediaryBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SalesIntermediaryBalanceStatus', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Party.prototype, "salesIntermediaryBalanceStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => party_related_entity_1.PartyRelated, (related) => related.party, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Party.prototype, "partyRelatedPersons", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => party_address_entity_1.PartyAddress, (address) => address.party, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Party.prototype, "partyAddresses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => party_phone_entity_1.PartyPhone, (phone) => phone.party, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Party.prototype, "partyPhones", void 0);
exports.Party = Party = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'Parties' }),
    (0, typeorm_1.Check)('"Nature" IN (\'real_person\', \'legal_entity\')')
], Party);
//# sourceMappingURL=party.entity.js.map