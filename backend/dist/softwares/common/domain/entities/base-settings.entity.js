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
exports.BaseSettings = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let BaseSettings = class BaseSettings extends app_base_entity_1.AppBaseEntity {
};
exports.BaseSettings = BaseSettings;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BaseSettingsID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BaseSettings.prototype, "baseSettingsID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'TabRef' }),
    __metadata("design:type", Number)
], BaseSettings.prototype, "tabRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, name: 'Key' }),
    __metadata("design:type", String)
], BaseSettings.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'Value' }),
    __metadata("design:type", String)
], BaseSettings.prototype, "value", void 0);
exports.BaseSettings = BaseSettings = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'BaseSettings' }),
    (0, typeorm_1.Index)(['tabRef', 'key', 'businessStructureRef', 'companyRef'], { unique: true })
], BaseSettings);
//# sourceMappingURL=base-settings.entity.js.map