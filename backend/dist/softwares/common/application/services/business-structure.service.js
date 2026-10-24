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
exports.BusinessStructureService = void 0;
const common_1 = require("@nestjs/common");
const business_structure_repository_1 = require("../../infrastructure/repositories/business-structure.repository");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const business_structure_enum_1 = require("../../domain/entities/business-structure.enum");
const seed_initializer_service_1 = require("./seed-initializer.service");
let BusinessStructureService = class BusinessStructureService {
    constructor(repository, idGenerationService, seedInitializerService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.seedInitializerService = seedInitializerService;
    }
    async onModuleInit() {
        try {
            await this.seedInitializerService.unseedAll(1);
        }
        catch (e) {
        }
        const all = await this.repository.findAll();
        const hasRoot = all.some(x => x.code === '01');
        const hasChild = all.some(x => x.code === '01-01');
        if (process.env.SYNC_DB === 'true' || !hasRoot || !hasChild) {
            try {
                console.log('BusinessStructureService: Ensuring default business structures and associated seeds exist...');
                await this.seedDefaults();
            }
            catch (error) {
                console.error('BusinessStructureService: Error ensuring defaults:', error);
            }
        }
    }
    async seedDefaults() {
        console.log('BusinessStructureService: seedDefaults started');
        try {
            await this.seedInitializerService.unseedAll(1);
        }
        catch (e) {
        }
        const all = await this.repository.findAll();
        let systemRoot = all.find(x => x.businessStructureId === 1);
        if (!systemRoot) {
            console.log('BusinessStructureService: Creating system root (ID 1)...');
            await this.idGenerationService.generateNextId('BusinessStructure');
            systemRoot = await this.repository.create({
                businessStructureId: 1,
                parentRef: 0,
                code: 'ROOT',
                title: 'ساختار سیستم',
                title_en: 'System Root',
                businessStructure: business_structure_enum_1.BusinessStructureType.Holding,
                isSystem: true,
                isActive: true,
            });
        }
        let headquarter = all.find(x => x.code === '01');
        if (!headquarter) {
            console.log('BusinessStructureService: Creating main headquarters (01)...');
            const hqId = await this.idGenerationService.generateNextId('BusinessStructure');
            const finalHqId = hqId === 1 ? await this.idGenerationService.generateNextId('BusinessStructure') : hqId;
            headquarter = await this.repository.create({
                businessStructureId: finalHqId,
                parentRef: 1,
                code: '01',
                title: 'دفتر مرکزی',
                title_en: 'Headquarters',
                businessStructure: business_structure_enum_1.BusinessStructureType.Holding,
                businessStructureName: 'Headquarters',
                isSystem: true,
                isActive: true,
                isBasicInfoShared: true,
                activeStructureTypes: '1,2,3,4',
            });
            console.log(`BusinessStructureService: Headquarters created with ID: ${headquarter.businessStructureId}`);
            await this.seedInitializerService.initializeSeeds(headquarter.businessStructureId);
        }
        else {
            console.log(`BusinessStructureService: Headquarters already exists (ID: ${headquarter.businessStructureId})`);
            if (headquarter.parentRef !== 1) {
                await this.repository.update(headquarter.businessStructureId, { parentRef: 1, isSystem: true });
            }
            await this.seedInitializerService.initializeSeeds(headquarter.businessStructureId);
        }
        let sampleCompany = all.find(x => x.code === '01-01');
        if (!sampleCompany) {
            console.log('BusinessStructureService: Creating sample company (01-01)...');
            const companyId = await this.idGenerationService.generateNextId('BusinessStructure');
            sampleCompany = await this.repository.create({
                businessStructureId: companyId,
                parentRef: headquarter.businessStructureId,
                code: '01-01',
                title: 'شرکت نمونه یک',
                title_en: 'Sample Company One',
                businessStructure: business_structure_enum_1.BusinessStructureType.Company,
                businessStructureName: 'Sample Company',
                isSystem: true,
                isActive: true,
                isBasicInfoShared: true,
            });
            console.log(`BusinessStructureService: Sample company created with ID: ${sampleCompany.businessStructureId}`);
            await this.seedInitializerService.initializeSeeds(sampleCompany.businessStructureId);
        }
        else {
            console.log(`BusinessStructureService: Sample company already exists (ID: ${sampleCompany.businessStructureId})`);
            await this.seedInitializerService.initializeSeeds(sampleCompany.businessStructureId);
        }
        console.log('BusinessStructureService: seedDefaults completed');
    }
    async create(dto, companyId = 2) {
        const nextId = await this.idGenerationService.generateNextId('BusinessStructure');
        const created = await this.repository.create({ ...dto, businessStructureId: nextId, isSystem: false, companyRef: companyId });
        return created;
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findById(id) {
        return this.repository.findById(id);
    }
    async updateAllSharing(isShared) {
        if (this.repository.updateAllSharing) {
            await this.repository.updateAllSharing(isShared);
        }
        else {
            await this.repository.repo.manager.query(`UPDATE "Gnr"."BusinessStructure" SET "IsBasicInfoShared" = $1 WHERE "BusinessStructureID" > 0`, [isShared]);
        }
        if (!isShared) {
            const all = await this.repository.findAll();
            const companies = all.filter(c => Number(c.businessStructure) === 2 && c.businessStructureId > 1);
            for (const comp of companies) {
                try {
                    await this.seedInitializerService.initializeSeeds(comp.businessStructureId);
                }
                catch (e) {
                    console.error(`Error initializing seeds for company ${comp.businessStructureId} on unshare:`, e);
                }
            }
        }
    }
    async update(id, dto, companyId = 2) {
        const res = await this.repository.update(id, { ...dto, companyRef: companyId });
        if (dto.isBasicInfoShared !== undefined) {
            const isShared = dto.isBasicInfoShared === true || String(dto.isBasicInfoShared) === 'true';
            await this.updateAllSharing(isShared);
        }
        return res;
    }
    async delete(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.BadRequestException('Item not found');
        }
        if (item.isSystem) {
            throw new common_1.BadRequestException('Cannot delete system default records');
        }
        const all = await this.repository.findAll();
        const children = all.filter(c => c.parentRef === id);
        if (children.length > 0) {
            throw new common_1.BadRequestException('Cannot delete a record that has children');
        }
        const unseedRes = await this.seedInitializerService.unseedAll(id);
        if (!unseedRes.success) {
            throw new common_1.BadRequestException(unseedRes.message);
        }
        await this.repository.delete(id);
    }
};
exports.BusinessStructureService = BusinessStructureService;
exports.BusinessStructureService = BusinessStructureService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IBusinessStructureRepository')),
    __metadata("design:paramtypes", [business_structure_repository_1.BusinessStructureRepository,
        id_generation_service_1.IdGenerationService,
        seed_initializer_service_1.SeedInitializerService])
], BusinessStructureService);
//# sourceMappingURL=business-structure.service.js.map