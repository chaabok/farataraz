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
exports.GeoLocation = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const geographic_type_enum_1 = require("./geographic-type.enum");
let GeoLocation = class GeoLocation extends app_base_entity_1.AppBaseEntity {
};
exports.GeoLocation = GeoLocation;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'GeolocationID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], GeoLocation.prototype, "geolocationId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ParentRef',
        type: 'bigint',
        nullable: false,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], GeoLocation.prototype, "parentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GeographicType', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], GeoLocation.prototype, "geographicType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], GeoLocation.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], GeoLocation.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], GeoLocation.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], GeoLocation.prototype, "isActive", void 0);
exports.GeoLocation = GeoLocation = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'GeoLocations' })
], GeoLocation);
//# sourceMappingURL=geo-location.entity.js.map