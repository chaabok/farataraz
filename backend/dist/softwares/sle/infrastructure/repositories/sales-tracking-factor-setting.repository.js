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
exports.SalesTrackingFactorSettingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_tracking_factor_setting_entity_1 = require("../../domain/entities/sales-tracking-factor-setting.entity");
let SalesTrackingFactorSettingRepository = class SalesTrackingFactorSettingRepository {
    constructor(repo) {
        this.repo = repo;
    }
    get manager() {
        return this.repo.manager;
    }
    async findAll(options) {
        return this.repo.find(options);
    }
    async findById(id) {
        return this.repo.findOne({ where: { SalesTrackingFactorSettingID: id } });
    }
    async findByType(type, businessStructureRef) {
        const where = { SalesDocumentType: type };
        if (businessStructureRef) {
            where.BusinessStructureRef = businessStructureRef;
        }
        return this.repo.findOne({ where });
    }
    async create(entity) {
        return this.repo.save(entity);
    }
    async update(id, attrs) {
        await this.repo.update({ SalesTrackingFactorSettingID: id }, attrs);
        const updated = await this.findById(id);
        if (!updated) {
            throw new Error(`SalesTrackingFactorSetting with ID ${id} not found after update`);
        }
        return updated;
    }
    async delete(id) {
        await this.repo.delete({ SalesTrackingFactorSettingID: id });
    }
};
exports.SalesTrackingFactorSettingRepository = SalesTrackingFactorSettingRepository;
exports.SalesTrackingFactorSettingRepository = SalesTrackingFactorSettingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_tracking_factor_setting_entity_1.SalesTrackingFactorSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SalesTrackingFactorSettingRepository);
//# sourceMappingURL=sales-tracking-factor-setting.repository.js.map