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
exports.ItemPackageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const item_package_entity_1 = require("../../domain/entities/item-package.entity");
const item_package_detail_entity_1 = require("../../domain/entities/item-package-detail.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ItemPackageService = class ItemPackageService {
    constructor(repository, detailRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.idGenService = idGenService;
        this.requestContextService = requestContextService;
    }
    getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId, fiscalYearId };
    }
    parseRef(val) {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0')
            return undefined;
        if (typeof val === 'object') {
            const innerId = val.id ?? val.MeasurementUnitID ?? val.ItemID ?? val.value;
            if (innerId !== undefined && innerId !== null) {
                const num = Number(innerId);
                return !isNaN(num) && num > 0 ? num : undefined;
            }
            return undefined;
        }
        const num = Number(val);
        return !isNaN(num) && num > 0 ? num : undefined;
    }
    async getNextNumber() {
        const { bsId, compId } = this.getScope();
        const maxResult = await this.repository
            .createQueryBuilder('pkg')
            .select('MAX(CAST(pkg.PackageCode AS integer))', 'max')
            .where('pkg.businessStructureRef = :bsId', { bsId })
            .andWhere('pkg.companyRef = :compId', { compId })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { packageCode: String(maxVal + 1) };
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        let pkgCode = dto.PackageCode;
        if (!pkgCode) {
            const next = await this.getNextNumber();
            pkgCode = next.packageCode;
        }
        const newPackageID = await this.idGenService.generateNextIdBlock('ItemPackage', 1);
        const nowTime = new Date().toTimeString().split(' ')[0];
        const itemPackage = this.repository.create({
            ItemPackageID: newPackageID,
            ItemType: dto.ItemType ?? 1,
            PackageCode: pkgCode,
            PackageTitle: dto.PackageTitle,
            PackageTitle2: dto.PackageTitle2 || undefined,
            MeasurementUnitRef: this.parseRef(dto.MeasurementUnitRef),
            Quantity: dto.Quantity !== undefined ? Number(dto.Quantity) : 1,
            Description: dto.Description || undefined,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            businessStructureRef: bsId,
            companyRef: compId,
            FiscalYearRef: fiscalYearId,
            creator: userId,
            lastModifier: userId,
            createTime: nowTime,
            lastModificationTime: nowTime,
        });
        const savedPackage = await this.repository.save(itemPackage);
        if (dto.items && dto.items.length > 0) {
            const validItems = dto.items.filter((item) => !!this.parseRef(item.ItemRef));
            if (validItems.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ItemPackageDetail', validItems.length);
                const detailsToSave = validItems.map((item, idx) => {
                    const itemRef = this.parseRef(item.ItemRef);
                    return this.detailRepository.create({
                        ItemPackageDetailID: startDetailId + idx,
                        ItemPackageRef: savedPackage.ItemPackageID,
                        RowNo: item.RowNo || idx + 1,
                        ItemRef: itemRef,
                        MeasurementUnitRef: this.parseRef(item.MeasurementUnitRef),
                        Quantity: item.Quantity !== undefined ? Number(item.Quantity) : 1,
                        Description: item.Description || undefined,
                        businessStructureRef: bsId,
                        companyRef: compId,
                        FiscalYearRef: fiscalYearId,
                        creator: userId,
                        lastModifier: userId,
                        createTime: nowTime,
                        lastModificationTime: nowTime,
                    });
                });
                await this.detailRepository.save(detailsToSave);
            }
        }
        return this.findOne(savedPackage.ItemPackageID);
    }
    async findAll(query) {
        const { bsId, compId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('pkg')
            .leftJoinAndSelect('pkg.MeasurementUnit', 'mu')
            .leftJoinAndSelect('pkg.Details', 'detail')
            .leftJoinAndSelect('detail.Item', 'item')
            .leftJoinAndSelect('detail.MeasurementUnit', 'detailMu')
            .where('pkg.businessStructureRef = :bsId', { bsId })
            .andWhere('pkg.companyRef = :compId', { compId })
            .orderBy('pkg.ItemPackageID', 'DESC');
        return qb.getMany();
    }
    async findOne(id) {
        const { bsId, compId } = this.getScope();
        const pkg = await this.repository
            .createQueryBuilder('pkg')
            .leftJoinAndSelect('pkg.MeasurementUnit', 'mu')
            .leftJoinAndSelect('pkg.Details', 'detail')
            .leftJoinAndSelect('detail.Item', 'item')
            .leftJoinAndSelect('detail.MeasurementUnit', 'detailMu')
            .where('pkg.ItemPackageID = :id', { id })
            .andWhere('pkg.businessStructureRef = :bsId', { bsId })
            .andWhere('pkg.companyRef = :compId', { compId })
            .orderBy('detail.RowNo', 'ASC')
            .getOne();
        if (!pkg) {
            throw new common_1.NotFoundException(`پک کالا خدمت با شناسه ${id} یافت نشد.`);
        }
        return pkg;
    }
    async update(id, dto) {
        const existing = await this.findOne(id);
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        const nowTime = new Date().toTimeString().split(' ')[0];
        if (dto.ItemType !== undefined)
            existing.ItemType = dto.ItemType;
        if (dto.PackageCode !== undefined)
            existing.PackageCode = dto.PackageCode;
        if (dto.PackageTitle !== undefined)
            existing.PackageTitle = dto.PackageTitle;
        if (dto.PackageTitle2 !== undefined)
            existing.PackageTitle2 = dto.PackageTitle2;
        if (dto.MeasurementUnitRef !== undefined)
            existing.MeasurementUnitRef = this.parseRef(dto.MeasurementUnitRef);
        if (dto.Quantity !== undefined)
            existing.Quantity = Number(dto.Quantity);
        if (dto.Description !== undefined)
            existing.Description = dto.Description;
        if (dto.IsActive !== undefined)
            existing.IsActive = dto.IsActive;
        existing.lastModifier = userId;
        existing.lastModificationTime = nowTime;
        await this.repository.save(existing);
        if (dto.items !== undefined) {
            await this.detailRepository.delete({ ItemPackageRef: id });
            const validItems = dto.items.filter((item) => !!this.parseRef(item.ItemRef));
            if (validItems.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ItemPackageDetail', validItems.length);
                const detailsToSave = validItems.map((item, idx) => {
                    const itemRef = this.parseRef(item.ItemRef);
                    return this.detailRepository.create({
                        ItemPackageDetailID: startDetailId + idx,
                        ItemPackageRef: id,
                        RowNo: item.RowNo || idx + 1,
                        ItemRef: itemRef,
                        MeasurementUnitRef: this.parseRef(item.MeasurementUnitRef),
                        Quantity: item.Quantity !== undefined ? Number(item.Quantity) : 1,
                        Description: item.Description || undefined,
                        businessStructureRef: bsId,
                        companyRef: compId,
                        FiscalYearRef: fiscalYearId,
                        creator: userId,
                        lastModifier: userId,
                        createTime: nowTime,
                        lastModificationTime: nowTime,
                    });
                });
                await this.detailRepository.save(detailsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const pkg = await this.findOne(id);
        await this.detailRepository.delete({ ItemPackageRef: id });
        await this.repository.remove(pkg);
        return { message: 'پک کالا خدمت با موفقیت حذف گردید.' };
    }
};
exports.ItemPackageService = ItemPackageService;
exports.ItemPackageService = ItemPackageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(item_package_entity_1.ItemPackage)),
    __param(1, (0, typeorm_1.InjectRepository)(item_package_detail_entity_1.ItemPackageDetail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ItemPackageService);
//# sourceMappingURL=item-package.service.js.map