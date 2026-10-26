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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoLocationController = void 0;
const common_1 = require("@nestjs/common");
const geo_location_service_1 = require("../../application/services/geo-location.service");
const create_geo_location_dto_1 = require("../../application/dtos/create-geo-location.dto");
const update_geo_location_dto_1 = require("../../application/dtos/update-geo-location.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let GeoLocationController = class GeoLocationController {
    constructor(service) {
        this.service = service;
    }
    async findAll() {
        const data = await this.service.findAll();
        return { data };
    }
    async getCities() {
        const data = await this.service.findAllCitiesFlattened();
        return { data };
    }
    async findOne(id) {
        const data = await this.service.findById(id);
        return { data };
    }
    async create(dto) {
        const data = await this.service.create(dto);
        return { data, message: 'GeoLocation created successfully' };
    }
    async update(id, dto) {
        const data = await this.service.update(id, dto);
        return { data, message: 'GeoLocation updated successfully' };
    }
    async delete(id) {
        await this.service.delete(id);
        return { message: 'GeoLocation deleted successfully' };
    }
};
exports.GeoLocationController = GeoLocationController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('cities'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "getCities", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_geo_location_dto_1.CreateGeoLocationDto]),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_geo_location_dto_1.UpdateGeoLocationDto]),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GeoLocationController.prototype, "delete", null);
exports.GeoLocationController = GeoLocationController = __decorate([
    (0, common_1.Controller)(['geo-locations', 'common/geo-locations']),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [geo_location_service_1.GeoLocationService])
], GeoLocationController);
//# sourceMappingURL=geo-location.controller.js.map