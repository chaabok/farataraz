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
exports.GeoLocationRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const geo_location_entity_1 = require("../../domain/entities/geo-location.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let GeoLocationRepository = class GeoLocationRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
        return this.repository.find({
            where,
            order: { geolocationId: 'ASC' }
        });
    }
    async findById(id) {
        return this.repository.findOne({ where: { geolocationId: id } });
    }
    async findByCode(code) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { code };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.repository.findOne({ where });
    }
    async create(geoLocation) {
        const { bsId, compId } = await this.getScope();
        if (!geoLocation.businessStructureRef || geoLocation.businessStructureRef <= 1)
            geoLocation.businessStructureRef = bsId;
        if (!geoLocation.companyRef || geoLocation.companyRef <= 1)
            geoLocation.companyRef = compId;
        return this.repository.save(geoLocation);
    }
    async update(id, updateData) {
        await this.repository.update(id, updateData);
        const updated = await this.findById(id);
        if (!updated)
            throw new common_1.NotFoundException('GeoLocation not found');
        return updated;
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async countChildren(parentId) {
        return this.repository.count({ where: { parentRef: parentId } });
    }
};
exports.GeoLocationRepository = GeoLocationRepository;
exports.GeoLocationRepository = GeoLocationRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(geo_location_entity_1.GeoLocation)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], GeoLocationRepository);
//# sourceMappingURL=geo-location.repository.js.map