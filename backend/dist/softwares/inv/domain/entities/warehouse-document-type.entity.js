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
exports.WarehouseDocumentType = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let WarehouseDocumentType = class WarehouseDocumentType extends app_base_entity_1.AppBaseEntity {
};
exports.WarehouseDocumentType = WarehouseDocumentType;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'WarehouseDocumentTypeID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], WarehouseDocumentType.prototype, "WarehouseDocumentTypeID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WarehouseDocumentTypeCode', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WarehouseDocumentType.prototype, "WarehouseDocumentTypeCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WarehouseDocumentTypeTitle', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseDocumentType.prototype, "WarehouseDocumentTypeTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WarehouseDocumentTypeTitle2', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseDocumentType.prototype, "WarehouseDocumentTypeTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WarehouseDocumentNature', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], WarehouseDocumentType.prototype, "WarehouseDocumentNature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HasBaseDocument', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WarehouseDocumentType.prototype, "HasBaseDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BaseDocumentTypeRefs', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WarehouseDocumentType.prototype, "BaseDocumentTypeRefs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WarehouseName', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseDocumentType.prototype, "WarehouseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedName', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], WarehouseDocumentType.prototype, "DetailedName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RelatedDetailedTypeRefs', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WarehouseDocumentType.prototype, "RelatedDetailedTypeRefs", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DisplayableItemNatures', type: 'json', nullable: true }),
    __metadata("design:type", Object)
], WarehouseDocumentType.prototype, "DisplayableItemNatures", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ShowPurchaseSalesParameters', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WarehouseDocumentType.prototype, "ShowPurchaseSalesParameters", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HasAccountingDocument', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WarehouseDocumentType.prototype, "HasAccountingDocument", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], WarehouseDocumentType.prototype, "IsActive", void 0);
exports.WarehouseDocumentType = WarehouseDocumentType = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseDocumentTypes' })
], WarehouseDocumentType);
//# sourceMappingURL=warehouse-document-type.entity.js.map