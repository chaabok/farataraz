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
exports.GeoLocationService = void 0;
const common_1 = require("@nestjs/common");
const geo_location_repository_interface_1 = require("../../domain/repositories/geo-location.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const geo_location_entity_1 = require("../../domain/entities/geo-location.entity");
const geographic_type_enum_1 = require("../../domain/entities/geographic-type.enum");
let GeoLocationService = class GeoLocationService {
    constructor(repository, idGenerationService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findAllCitiesFlattened() {
        const all = await this.repository.findAll();
        const map = new Map(all.map(item => [item.geolocationId, item]));
        const cities = all.filter(item => item.geographicType === geographic_type_enum_1.GeographicType.City);
        return cities.map(city => {
            const province = map.get(city.parentRef);
            const country = province ? map.get(province.parentRef) : null;
            return {
                id: city.geolocationId,
                code: city.code,
                title: city.title,
                latinTitle: city.titleEn,
                province: province ? province.title : '',
                country: country ? country.title : ''
            };
        });
    }
    async findById(id) {
        const item = await this.repository.findById(id);
        if (!item)
            throw new common_1.NotFoundException('GeoLocation not found');
        return item;
    }
    async create(dto) {
        const existing = await this.repository.findByCode(dto.code);
        if (existing) {
            throw new common_1.BadRequestException('کد تکراری است');
        }
        const newId = await this.idGenerationService.generateNextId('GeoLocation');
        const entity = new geo_location_entity_1.GeoLocation();
        entity.geolocationId = newId;
        entity.parentRef = dto.parentRef || 0;
        entity.geographicType = dto.geographicType;
        entity.code = dto.code;
        entity.title = dto.title;
        entity.titleEn = dto.titleEn;
        entity.isActive = dto.isActive !== undefined ? dto.isActive : true;
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const item = await this.findById(id);
        if (dto.code && dto.code !== item.code) {
            const existing = await this.repository.findByCode(dto.code);
            if (existing && existing.geolocationId !== id) {
                throw new common_1.BadRequestException('کد تکراری است');
            }
        }
        return this.repository.update(id, dto);
    }
    async delete(id) {
        const item = await this.findById(id);
        const childrenCount = await this.repository.countChildren(id);
        if (childrenCount > 0) {
            throw new common_1.BadRequestException('ابتدا زیرشاخه‌ها را حذف کنید');
        }
        await this.repository.delete(id);
        return { success: true };
    }
};
exports.GeoLocationService = GeoLocationService;
exports.GeoLocationService = GeoLocationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(geo_location_repository_interface_1.IGeoLocationRepository)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService])
], GeoLocationService);
//# sourceMappingURL=geo-location.service.js.map