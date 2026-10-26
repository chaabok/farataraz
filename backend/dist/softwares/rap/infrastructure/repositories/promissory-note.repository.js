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
exports.PromissoryNoteRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const promissory_note_entity_1 = require("../../domain/entities/promissory-note.entity");
const promissory_note_item_entity_1 = require("../../domain/entities/promissory-note-item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let PromissoryNoteRepository = class PromissoryNoteRepository {
    constructor(repository, itemRepository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
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
        catch (e) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async findAll() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('note')
            .leftJoinAndSelect('note.cash', 'cash');
        if (isShared) {
            qb.where('note.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('note.companyRef = :compId', { compId });
        }
        return qb.getMany();
    }
    async findWithPagination(params) {
        const { pageIndex = 0, pageSize = 10, sorting, columnFilters, globalFilter, advancedFilters } = params;
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('note')
            .leftJoinAndSelect('note.cash', 'cash');
        if (isShared) {
            qb.where('note.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('note.companyRef = :compId', { compId });
        }
        if (columnFilters) {
            try {
                const filters = typeof columnFilters === 'string' ? JSON.parse(columnFilters) : columnFilters;
                filters.forEach((filter, index) => {
                    if (filter.id && filter.value) {
                        let filterField = `note.${filter.id}`;
                        if (filter.id.includes('.')) {
                            const parts = filter.id.split('.');
                            filterField = `${parts[0]}.${parts[1]}`;
                        }
                        qb.andWhere(`${filterField} LIKE :filterValue${index}`, {
                            [`filterValue${index}`]: `%${filter.value}%`
                        });
                    }
                });
            }
            catch (e) {
                console.error('Error parsing columnFilters:', e);
            }
        }
        if (globalFilter) {
            qb.andWhere('(note.series LIKE :global OR cash.title LIKE :global OR CAST(note.promissoryNoteId AS varchar) LIKE :global)', {
                global: `%${globalFilter}%`
            });
        }
        if (sorting) {
            try {
                const _sorting = typeof sorting === 'string' ? JSON.parse(sorting) : sorting;
                if (_sorting && _sorting.length > 0) {
                    _sorting.forEach((s) => {
                        let sortField = `note.${s.id}`;
                        if (s.id.includes('.')) {
                            const parts = s.id.split('.');
                            sortField = `${parts[0]}.${parts[1]}`;
                        }
                        qb.addOrderBy(sortField, s.desc ? 'DESC' : 'ASC');
                    });
                }
                else {
                    qb.orderBy('note.promissoryNoteId', 'DESC');
                }
            }
            catch (e) {
                console.error('Error parsing sorting:', e);
                qb.orderBy('note.promissoryNoteId', 'DESC');
            }
        }
        else {
            qb.orderBy('note.promissoryNoteId', 'DESC');
        }
        const [data, total] = await qb
            .skip(pageIndex * pageSize)
            .take(pageSize)
            .getManyAndCount();
        return { data, total };
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('note')
            .leftJoinAndSelect('note.items', 'items')
            .leftJoinAndSelect('note.cash', 'cash')
            .where('note.promissoryNoteId = :id', { id });
        if (isShared) {
            qb.andWhere('note.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('note.companyRef = :compId', { compId });
        }
        return qb.getOne();
    }
    async findUnusedItems() {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.itemRepository.createQueryBuilder('item')
            .leftJoinAndSelect('item.promissoryNote', 'note')
            .where('item.status = 1');
        if (isShared) {
            qb.andWhere('note.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.andWhere('note.companyRef = :compId', { compId });
        }
        return qb.getMany();
    }
    async create(data) {
        const { bsId, compId, isShared } = await this.getScope();
        const id = await this.idGenerationService.generateNextId('PromissoryNote');
        const payload = {
            ...data,
            promissoryNoteId: id,
            businessStructureRef: bsId,
            companyRef: compId,
            cashRef: data.cashRef || data['cashRef'] || data['CashRef'] || data['cash']?.['cashId']
        };
        if (payload.series) {
            const qb = this.repository.createQueryBuilder('note')
                .where('note.series = :series', { series: payload.series });
            if (isShared) {
                qb.andWhere('note.businessStructureRef = :bsId', { bsId });
            }
            else {
                qb.andWhere('note.companyRef = :compId', { compId });
            }
            const existing = await qb.getOne();
            if (existing) {
                throw new Error("PromissoryNote with this series already exists in the current scope.");
            }
        }
        if (payload.items && Array.isArray(payload.items)) {
            const newItems = payload.items.filter(item => !item.promissoryNoteItemId || item.id?.toString().startsWith('temp'));
            if (newItems.length > 0) {
                const startId = await this.idGenerationService.generateNextIdBlock('PromissoryNoteItem', newItems.length);
                let currentId = startId;
                for (const item of payload.items) {
                    if (!item.promissoryNoteItemId || item.id?.toString().startsWith('temp')) {
                        item.promissoryNoteItemId = currentId++;
                        item.promissoryNoteRef = id;
                    }
                    delete item.id;
                }
            }
            else {
                for (const item of payload.items) {
                    delete item.id;
                }
            }
        }
        const note = this.repository.create(payload);
        return this.repository.save(note);
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new Error('Not found');
        const payload = {
            ...existing,
            ...data,
            cashRef: data.cashRef || data['cashRef'] || existing.cashRef,
            promissoryNoteId: id
        };
        if (payload.items && Array.isArray(payload.items)) {
            const newItems = payload.items.filter(item => !item.promissoryNoteItemId || item.id?.toString().startsWith('temp'));
            if (newItems.length > 0) {
                const startId = await this.idGenerationService.generateNextIdBlock('PromissoryNoteItem', newItems.length);
                let currentId = startId;
                for (const item of payload.items) {
                    if (!item.promissoryNoteItemId || item.id?.toString().startsWith('temp')) {
                        item.promissoryNoteItemId = currentId++;
                        item.promissoryNoteRef = id;
                    }
                    delete item.id;
                }
            }
            else {
                for (const item of payload.items) {
                    delete item.id;
                }
            }
        }
        return this.repository.save(payload);
    }
    async delete(id) {
        console.log(`Starting DELETE for PromissoryNote ID: ${id}`);
        try {
            await this.itemRepository.delete({ promissoryNoteRef: id });
            console.log(`Successfully deleted items for PromissoryNote ID: ${id}`);
            await this.repository.delete({ promissoryNoteId: id });
            console.log(`Successfully deleted PromissoryNote ID: ${id}`);
        }
        catch (error) {
            console.error(`Error deleting PromissoryNote ID: ${id}`, error);
            throw error;
        }
    }
};
exports.PromissoryNoteRepository = PromissoryNoteRepository;
exports.PromissoryNoteRepository = PromissoryNoteRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(promissory_note_entity_1.PromissoryNote)),
    __param(1, (0, typeorm_1.InjectRepository)(promissory_note_item_entity_1.PromissoryNoteItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], PromissoryNoteRepository);
//# sourceMappingURL=promissory-note.repository.js.map