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
exports.ChequebookItem = exports.CheckStatus = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const chequebook_entity_1 = require("./chequebook.entity");
var CheckStatus;
(function (CheckStatus) {
    CheckStatus[CheckStatus["NORMAL"] = 1] = "NORMAL";
    CheckStatus[CheckStatus["CANCELED"] = 2] = "CANCELED";
    CheckStatus[CheckStatus["ISSUED"] = 3] = "ISSUED";
    CheckStatus[CheckStatus["PASSED"] = 4] = "PASSED";
})(CheckStatus || (exports.CheckStatus = CheckStatus = {}));
let ChequebookItem = class ChequebookItem extends app_base_entity_1.AppBaseEntity {
};
exports.ChequebookItem = ChequebookItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ChequebookItemID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ChequebookItem.prototype, "chequebookItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chequebook_entity_1.Chequebook, cb => cb.items, { onDelete: "CASCADE" }),
    (0, typeorm_1.JoinColumn)({ name: "ChequebookRef", referencedColumnName: "chequebookId" }),
    __metadata("design:type", chequebook_entity_1.Chequebook)
], ChequebookItem.prototype, "chequebook", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ChequebookRef", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], ChequebookItem.prototype, "chequebookRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "CheckNumber", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], ChequebookItem.prototype, "checkNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Receiver", type: "varchar", length: 255, nullable: true }),
    __metadata("design:type", String)
], ChequebookItem.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "IssueDate", type: "varchar", length: 15, nullable: true }),
    __metadata("design:type", String)
], ChequebookItem.prototype, "issueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Amount", type: "numeric", precision: 20, scale: 4, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : null
        } }),
    __metadata("design:type", Number)
], ChequebookItem.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Status", type: "int", default: CheckStatus.NORMAL }),
    __metadata("design:type", Number)
], ChequebookItem.prototype, "status", void 0);
exports.ChequebookItem = ChequebookItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ChequebookItems' })
], ChequebookItem);
//# sourceMappingURL=chequebook-item.entity.js.map