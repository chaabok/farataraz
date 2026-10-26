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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PettyCashSummaryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const petty_cash_summary_entity_1 = require("../../domain/entities/petty-cash-summary.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const petty_cash_summary_item_entity_1 = require("../../domain/entities/petty-cash-summary-item.entity");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
function parseSafeDate(dateStr) {
    if (dateStr === undefined || dateStr === null || dateStr === '')
        return null;
    let d;
    if (typeof dateStr === 'string') {
        const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
        const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
        let cleanStr = dateStr;
        for (let i = 0; i < 10; i++) {
            cleanStr = cleanStr.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
        }
        if (cleanStr.includes('/')) {
            d = (0, moment_jalaali_1.default)(cleanStr, 'jYYYY/jMM/jDD').toDate();
        }
        else if (cleanStr.includes('-')) {
            const parts = cleanStr.split('-');
            if (parts.length === 3 && !cleanStr.includes('T')) {
                d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
            else {
                d = new Date(cleanStr);
            }
        }
        else {
            d = new Date(cleanStr);
        }
    }
    else {
        d = new Date(dateStr);
    }
    return isNaN(d.getTime()) ? null : d;
}
let PettyCashSummaryService = class PettyCashSummaryService {
    constructor(repository, requestContextService, idGenerationService, dataSource) {
        this.repository = repository;
        this.requestContextService = requestContextService;
        this.idGenerationService = idGenerationService;
        this.dataSource = dataSource;
    }
    async findAll(options) {
        const [data, total] = await this.repository.findAll(options);
        const mappedData = data.map(item => {
            let totalAmount = 0;
            if (item.items && Array.isArray(item.items)) {
                totalAmount = item.items.reduce((sum, current) => sum + (Number(current.amount) || 0), 0);
            }
            let pettyCashName = '';
            if (item.pettyCash?.party) {
                if (item.pettyCash.party.detailedAccount?.title) {
                    pettyCashName = item.pettyCash.party.detailedAccount.title;
                }
                else {
                    pettyCashName = `${item.pettyCash.party.firstName || ''} ${item.pettyCash.party.lastName || ''}`.trim();
                }
            }
            const currentBalance = item.pettyCash?.currentBalance || 0;
            return {
                ...item,
                pettyCashName,
                currentBalance,
                totalAmount
            };
        });
        return { items: mappedData, total };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new common_1.NotFoundException(`PettyCashSummary with ID ${id} not found`);
        }
        return entity;
    }
    async getNextNumbers(jalaliDateStr) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        let dateStr = jalaliDateStr;
        if (!dateStr) {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        return {
            documentNumber: docRes.nextValue,
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            error: docRes.error || null,
        };
    }
    async create(createDto) {
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const id = await this.idGenerationService.generateNextId('PettyCashSummaries');
        let dateStr = '';
        if (createDto.date) {
            dateStr = (0, moment_jalaali_1.default)(createDto.date).format('jYYYY/jMM/jDD');
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.error) {
            throw new common_1.BadRequestException(docRes.error);
        }
        if (docRes.numberingMethod === '2' || !createDto.number) {
            createDto.number = Number(docRes.nextValue);
        }
        const entity = new petty_cash_summary_entity_1.PettyCashSummary();
        entity.pettyCashSummaryId = id;
        entity.pettyCashRef = createDto.pettyCashRef;
        entity.number = createDto.number;
        entity.date = parseSafeDate(createDto.date) || new Date();
        entity.description = createDto.description;
        entity.fiscalYearRef = createDto.fiscalYearRef || this.requestContextService.getFiscalYearId() || 1;
        if (createDto.voucherHeaderRef !== undefined) {
            entity.voucherHeaderRef = createDto.voucherHeaderRef;
        }
        if (createDto.state !== undefined) {
            entity.state = createDto.state;
        }
        entity.businessStructureRef = businessStructureId;
        entity.companyRef = companyId;
        if (createDto.items && createDto.items.length > 0) {
            entity.items = await Promise.all(createDto.items.map(async (itemDto) => {
                const item = new petty_cash_summary_item_entity_1.PettyCashSummaryItem();
                item.pettyCashSummaryItemId = await this.idGenerationService.generateNextId('PettyCashSummaryItems');
                item.reasonRef = itemDto.reasonRef;
                item.paymentReceiptNumber = itemDto.paymentReceiptNumber;
                item.paymentReceiptDate = parseSafeDate(itemDto.paymentReceiptDate);
                item.amount = itemDto.amount;
                item.description = itemDto.description;
                item.businessStructureRef = businessStructureId;
                item.companyRef = companyId;
                item.pettyCashSummaryRef = id;
                return item;
            }));
        }
        else {
            entity.items = [];
        }
        return this.repository.create(entity);
    }
    async update(id, updateDto) {
        const entity = await this.findOne(id);
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        let dateStr = '';
        if (updateDto.date) {
            dateStr = (0, moment_jalaali_1.default)(updateDto.date).format('jYYYY/jMM/jDD');
        }
        else if (entity.date) {
            dateStr = (0, moment_jalaali_1.default)(entity.date).format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
        if (docRes.numberingMethod === '2') {
            if (updateDto.number !== undefined) {
                updateDto.number = entity.number;
            }
        }
        if (updateDto.pettyCashRef !== undefined)
            entity.pettyCashRef = updateDto.pettyCashRef;
        if (updateDto.number !== undefined)
            entity.number = updateDto.number;
        if (updateDto.date !== undefined) {
            const parsedDate = parseSafeDate(updateDto.date);
            if (parsedDate) {
                entity.date = parsedDate;
            }
        }
        if (updateDto.description !== undefined)
            entity.description = updateDto.description;
        if (updateDto.fiscalYearRef !== undefined)
            entity.fiscalYearRef = updateDto.fiscalYearRef;
        if (updateDto.voucherHeaderRef !== undefined)
            entity.voucherHeaderRef = updateDto.voucherHeaderRef;
        if (updateDto.state !== undefined)
            entity.state = updateDto.state;
        if (updateDto.items) {
            await this.dataSource.manager.delete(petty_cash_summary_item_entity_1.PettyCashSummaryItem, { pettyCashSummaryRef: id });
            const newItems = await Promise.all(updateDto.items.map(async (itemDto) => {
                const item = new petty_cash_summary_item_entity_1.PettyCashSummaryItem();
                item.pettyCashSummaryItemId = await this.idGenerationService.generateNextId('PettyCashSummaryItems');
                item.reasonRef = itemDto.reasonRef;
                item.paymentReceiptNumber = itemDto.paymentReceiptNumber;
                item.paymentReceiptDate = parseSafeDate(itemDto.paymentReceiptDate);
                item.amount = itemDto.amount;
                item.description = itemDto.description;
                item.businessStructureRef = businessStructureId;
                item.companyRef = companyId;
                item.pettyCashSummaryRef = entity.pettyCashSummaryId;
                return item;
            }));
            await this.dataSource.manager.save(newItems);
            delete entity.items;
        }
        const saved = await this.repository.create(entity);
        if (updateDto.items) {
            saved.items = await this.dataSource.manager.find(petty_cash_summary_item_entity_1.PettyCashSummaryItem, { where: { pettyCashSummaryRef: id } });
        }
        return saved;
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
    async isUsed(id) {
        return this.repository.isUsed(id);
    }
};
exports.PettyCashSummaryService = PettyCashSummaryService;
exports.PettyCashSummaryService = PettyCashSummaryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IPettyCashSummaryRepository')),
    __param(3, (0, typeorm_2.InjectDataSource)()),
    __metadata("design:paramtypes", [Object, request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService,
        typeorm_1.DataSource])
], PettyCashSummaryService);
//# sourceMappingURL=petty-cash-summary.service.js.map