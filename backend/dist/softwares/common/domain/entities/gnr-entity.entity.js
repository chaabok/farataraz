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
exports.GnrEntity = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const entity_type_enum_1 = require("./entity-type.enum");
let GnrEntity = class GnrEntity extends app_base_entity_1.AppBaseEntity {
};
exports.GnrEntity = GnrEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'EntityID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : value
        }
    }),
    __metadata("design:type", Number)
], GnrEntity.prototype, "entityID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ParentRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], GnrEntity.prototype, "parentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EntityName', type: 'text', nullable: false }),
    __metadata("design:type", String)
], GnrEntity.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'EntityType',
        type: 'int',
        nullable: false
    }),
    __metadata("design:type", Number)
], GnrEntity.prototype, "entityType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => GnrEntity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef' }),
    __metadata("design:type", GnrEntity)
], GnrEntity.prototype, "parent", void 0);
exports.GnrEntity = GnrEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'Entities', schema: 'Gnr' })
], GnrEntity);
//# sourceMappingURL=gnr-entity.entity.js.map