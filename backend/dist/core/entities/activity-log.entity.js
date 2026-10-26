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
exports.ActivityLog = exports.ActivityAction = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("./app-base.entity");
var ActivityAction;
(function (ActivityAction) {
    ActivityAction["CREATE"] = "CREATE";
    ActivityAction["UPDATE"] = "UPDATE";
    ActivityAction["DELETE"] = "DELETE";
    ActivityAction["PRINT"] = "PRINT";
    ActivityAction["EXPORT_EXCEL"] = "EXPORT_EXCEL";
    ActivityAction["EXPORT_WORD"] = "EXPORT_WORD";
    ActivityAction["EXPORT_PDF"] = "EXPORT_PDF";
    ActivityAction["UPLOAD"] = "UPLOAD";
    ActivityAction["DOWNLOAD"] = "DOWNLOAD";
    ActivityAction["OTHER"] = "OTHER";
})(ActivityAction || (exports.ActivityAction = ActivityAction = {}));
let ActivityLog = class ActivityLog extends app_base_entity_1.AppBaseEntity {
};
exports.ActivityLog = ActivityLog;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], ActivityLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Action', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], ActivityLog.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EntityName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "entityName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EntityId', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "entityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OldValues', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "oldValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NewValues', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], ActivityLog.prototype, "newValues", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IpAddress', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserAgent', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Url', type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Method', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ActivityLog.prototype, "description", void 0);
exports.ActivityLog = ActivityLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'ActivityLog', schema: 'Gnr' })
], ActivityLog);
//# sourceMappingURL=activity-log.entity.js.map