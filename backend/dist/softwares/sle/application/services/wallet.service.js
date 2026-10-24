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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const wallet_repository_interface_1 = require("../../domain/repositories/wallet.repository.interface");
const wallet_entity_1 = require("../../domain/entities/wallet.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let WalletService = class WalletService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
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
        return this.repository.findAll({ where });
    }
    async findById(id) {
        const wallet = await this.repository.findById(id);
        if (!wallet) {
            throw new common_1.NotFoundException(`Wallet with ID ${id} not found`);
        }
        return wallet;
    }
    async getNextNumber() {
        const wallets = await this.findAll();
        let max = 0;
        for (const w of wallets) {
            if (w.Code && w.Code > max) {
                max = w.Code;
            }
        }
        return {
            documentNumber: max + 1,
            isDocumentNumberAuto: false,
        };
    }
    async checkDuplicate(field, value, excludeId) {
        if (value === undefined || value === null || String(value).trim() === '')
            return false;
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(wallet_entity_1.Wallet, 'w');
        qb.where(`w.${field} = :value`, { value });
        if (isShared) {
            qb.andWhere('w.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('w.companyRef = :compId', { compId });
        }
        if (excludeId) {
            qb.andWhere('w.WalletID != :excludeId', { excludeId });
        }
        const count = await qb.getCount();
        return count > 0;
    }
    async create(dto) {
        const { bsId, compId, isShared } = await this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        if (!dto.Code) {
            throw new common_1.BadRequestException('فیلد کد اجباری است.');
        }
        if (!dto.Title) {
            throw new common_1.BadRequestException('فیلد عنوان اجباری است.');
        }
        if (await this.checkDuplicate('Code', dto.Code)) {
            throw new common_1.BadRequestException('کد کیف پول تکراری است.');
        }
        if (await this.checkDuplicate('Title', dto.Title)) {
            throw new common_1.BadRequestException('عنوان کیف پول تکراری است.');
        }
        const title2 = dto.Title2 && dto.Title2.trim() !== '' ? dto.Title2 : dto.Title;
        const id = dto.WalletID || (await this.idGenerationService.generateNextId('Wallets'));
        const entity = this.repository.manager.create(wallet_entity_1.Wallet, {
            WalletID: id,
            Code: dto.Code,
            Title: dto.Title,
            Title2: title2,
            Nature: dto.Nature !== undefined ? dto.Nature : 1,
            IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
            Description: dto.Description || '',
            creator: userId,
            lastModifier: userId,
            companyRef: compId,
            businessStructureRef: bsId,
        });
        return this.repository.create(entity);
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        if (dto.Code !== undefined && dto.Code !== existing.Code) {
            if (await this.checkDuplicate('Code', dto.Code, id)) {
                throw new common_1.BadRequestException('کد کیف پول تکراری است.');
            }
        }
        if (dto.Title !== undefined && dto.Title !== existing.Title) {
            if (await this.checkDuplicate('Title', dto.Title, id)) {
                throw new common_1.BadRequestException('عنوان کیف پول تکراری است.');
            }
        }
        const title2 = dto.Title2 !== undefined
            ? (dto.Title2.trim() !== '' ? dto.Title2 : (dto.Title || existing.Title))
            : existing.Title2;
        const userId = this.requestContextService.getUserId() || 1;
        const updateData = {
            ...dto,
            Title2: title2,
            lastModifier: userId,
        };
        return this.repository.update(id, updateData);
    }
    async remove(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(wallet_repository_interface_1.IWalletRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map