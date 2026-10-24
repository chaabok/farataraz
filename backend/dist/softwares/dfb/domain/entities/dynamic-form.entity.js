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
exports.DynamicForm = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let DynamicForm = class DynamicForm extends app_base_entity_1.AppBaseEntity {
};
exports.DynamicForm = DynamicForm;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint', name: 'DynamicFormID' }),
    __metadata("design:type", Number)
], DynamicForm.prototype, "dynamicFormId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'FormCode', length: 100, unique: true }),
    __metadata("design:type", String)
], DynamicForm.prototype, "formCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'Title', length: 255 }),
    __metadata("design:type", String)
], DynamicForm.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'Description', length: 500, nullable: true }),
    __metadata("design:type", String)
], DynamicForm.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'ComponentName', length: 100, nullable: true }),
    __metadata("design:type", String)
], DynamicForm.prototype, "componentName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Bands', nullable: true, default: '[]' }),
    __metadata("design:type", Array)
], DynamicForm.prototype, "bands", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Fields', default: '[]' }),
    __metadata("design:type", Array)
], DynamicForm.prototype, "fields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Styles', default: '{}' }),
    __metadata("design:type", Object)
], DynamicForm.prototype, "styles", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'MenuConfig', nullable: true, default: '{}' }),
    __metadata("design:type", Object)
], DynamicForm.prototype, "menuConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Options', nullable: true, default: '{}' }),
    __metadata("design:type", Object)
], DynamicForm.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'ShowPrintList', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], DynamicForm.prototype, "showPrintList", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'ShowVoucherActionbar', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], DynamicForm.prototype, "showVoucherActionbar", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'IsActive', default: true }),
    __metadata("design:type", Boolean)
], DynamicForm.prototype, "isActive", void 0);
exports.DynamicForm = DynamicForm = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Dfb', name: 'DynamicForm' })
], DynamicForm);
//# sourceMappingURL=dynamic-form.entity.js.map