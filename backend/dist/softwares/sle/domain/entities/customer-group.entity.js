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
exports.CustomerGroup = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
let CustomerGroup = class CustomerGroup extends app_base_entity_1.AppBaseEntity {
};
exports.CustomerGroup = CustomerGroup;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], CustomerGroup.prototype, "CustomerGroupID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], CustomerGroup.prototype, "Code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: false }),
    __metadata("design:type", String)
], CustomerGroup.prototype, "Title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], CustomerGroup.prototype, "Title2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], CustomerGroup.prototype, "DetailedAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { nullable: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountRef', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], CustomerGroup.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], CustomerGroup.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false, nullable: true }),
    __metadata("design:type", Boolean)
], CustomerGroup.prototype, "IsMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], CustomerGroup.prototype, "ParentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CustomerGroup, (group) => group.children, { nullable: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef', referencedColumnName: 'CustomerGroupID' }),
    __metadata("design:type", CustomerGroup)
], CustomerGroup.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CustomerGroup, (group) => group.parent),
    __metadata("design:type", Array)
], CustomerGroup.prototype, "children", void 0);
exports.CustomerGroup = CustomerGroup = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'CustomerGroups' })
], CustomerGroup);
//# sourceMappingURL=customer-group.entity.js.map