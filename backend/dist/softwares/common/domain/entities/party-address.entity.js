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
exports.PartyAddress = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const party_entity_1 = require("./party.entity");
let PartyAddress = class PartyAddress extends app_base_entity_1.AppBaseEntity {
};
exports.PartyAddress = PartyAddress;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PartyAddressID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PartyAddress.prototype, "partyAddressId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PartyRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PartyAddress.prototype, "partyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, (party) => party.partyAddresses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], PartyAddress.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AddressType', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "addressType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'City', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FullAddress', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "fullAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PostalCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "postalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Longitude', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Latitude', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartyAddress.prototype, "latitude", void 0);
exports.PartyAddress = PartyAddress = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'PartiesAddresses' })
], PartyAddress);
//# sourceMappingURL=party-address.entity.js.map