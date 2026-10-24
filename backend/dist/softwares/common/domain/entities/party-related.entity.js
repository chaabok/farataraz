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
exports.PartyRelated = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const party_entity_1 = require("./party.entity");
let PartyRelated = class PartyRelated extends app_base_entity_1.AppBaseEntity {
};
exports.PartyRelated = PartyRelated;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PartyRelatedID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PartyRelated.prototype, "partyRelatedId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PartyRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PartyRelated.prototype, "partyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, (party) => party.partyRelatedPersons, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], PartyRelated.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'FirstName', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], PartyRelated.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LastName', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], PartyRelated.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Relation', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], PartyRelated.prototype, "relation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NationalCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartyRelated.prototype, "nationalCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Phone', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartyRelated.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PartyRelated.prototype, "description", void 0);
exports.PartyRelated = PartyRelated = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'PartiesRelated' })
], PartyRelated);
//# sourceMappingURL=party-related.entity.js.map