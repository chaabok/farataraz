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
exports.OtherDetails = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let OtherDetails = class OtherDetails extends app_base_entity_1.AppBaseEntity {
};
exports.OtherDetails = OtherDetails;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'OtherDetailsID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], OtherDetails.prototype, "otherDetailsId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], OtherDetails.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], OtherDetails.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedCode', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], OtherDetails.prototype, "detailedCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], OtherDetails.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isActive', type: 'boolean', default: true, nullable: false }),
    __metadata("design:type", Boolean)
], OtherDetails.prototype, "isActive", void 0);
exports.OtherDetails = OtherDetails = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'OtherDetails' })
], OtherDetails);
//# sourceMappingURL=other-details.entity.js.map