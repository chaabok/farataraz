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
exports.DynamicFormRecord = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const dynamic_form_entity_1 = require("./dynamic-form.entity");
let DynamicFormRecord = class DynamicFormRecord extends app_base_entity_1.AppBaseEntity {
};
exports.DynamicFormRecord = DynamicFormRecord;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint', name: 'DynamicFormRecordID' }),
    __metadata("design:type", Number)
], DynamicFormRecord.prototype, "dynamicFormRecordId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', name: 'FormRef' }),
    __metadata("design:type", Number)
], DynamicFormRecord.prototype, "formRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => dynamic_form_entity_1.DynamicForm, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'FormRef' }),
    __metadata("design:type", dynamic_form_entity_1.DynamicForm)
], DynamicFormRecord.prototype, "form", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Data', default: '{}' }),
    __metadata("design:type", Object)
], DynamicFormRecord.prototype, "data", void 0);
exports.DynamicFormRecord = DynamicFormRecord = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Dfb', name: 'DynamicFormRecord' })
], DynamicFormRecord);
//# sourceMappingURL=dynamic-form-record.entity.js.map