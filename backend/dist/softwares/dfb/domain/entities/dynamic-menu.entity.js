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
exports.DynamicMenu = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let DynamicMenu = class DynamicMenu extends app_base_entity_1.AppBaseEntity {
};
exports.DynamicMenu = DynamicMenu;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint', name: 'DynamicMenuID' }),
    __metadata("design:type", Number)
], DynamicMenu.prototype, "dynamicMenuId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'MenuType', length: 50 }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "menuType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'MenuKey', length: 150 }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "menuKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'GroupId', length: 100, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "groupId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'MenuTitle', length: 255, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "menuTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'Title', length: 255, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'TitleEn', length: 255, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'Icon', length: 100, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "icon", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', name: 'Color', length: 50, nullable: true }),
    __metadata("design:type", String)
], DynamicMenu.prototype, "color", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', name: 'Priority', nullable: true, default: 0 }),
    __metadata("design:type", Number)
], DynamicMenu.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', name: 'Config', nullable: true, default: '{}' }),
    __metadata("design:type", Object)
], DynamicMenu.prototype, "config", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'IsActive', default: true }),
    __metadata("design:type", Boolean)
], DynamicMenu.prototype, "isActive", void 0);
exports.DynamicMenu = DynamicMenu = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Dfb', name: 'DynamicMenu' })
], DynamicMenu);
//# sourceMappingURL=dynamic-menu.entity.js.map