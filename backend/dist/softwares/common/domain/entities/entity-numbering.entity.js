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
exports.EntityNumbering = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let EntityNumbering = class EntityNumbering extends app_base_entity_1.AppBaseEntity {
};
exports.EntityNumbering = EntityNumbering;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'EntityNumberingID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], EntityNumbering.prototype, "entityNumberingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EntityRef', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], EntityNumbering.prototype, "entityRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NumberingMethod', type: 'varchar', length: 10, default: '2' }),
    __metadata("design:type", String)
], EntityNumbering.prototype, "numberingMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NumberingType', type: 'varchar', length: 10, default: '1' }),
    __metadata("design:type", String)
], EntityNumbering.prototype, "numberingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseNumbering', type: 'simple-json', nullable: true }),
    __metadata("design:type", Array)
], EntityNumbering.prototype, "baseNumbering", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Items', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], EntityNumbering.prototype, "items", void 0);
exports.EntityNumbering = EntityNumbering = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'EntityNumbering' })
], EntityNumbering);
//# sourceMappingURL=entity-numbering.entity.js.map