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
exports.FiscalYearService = void 0;
const common_1 = require("@nestjs/common");
let FiscalYearService = class FiscalYearService {
    constructor(repository) {
        this.repository = repository;
    }
    validateDates(startDate, endDate) {
        if (endDate < startDate) {
            throw new common_1.BadRequestException('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
        }
        const utc1 = Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
        const utc2 = Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());
        const diffDays = Math.round(Math.abs(utc2 - utc1) / (1000 * 60 * 60 * 24));
        if (diffDays > 366) {
            throw new common_1.BadRequestException('بازه سال مالی نمی‌تواند بیشتر از 366 روز باشد.');
        }
    }
    async checkDuplicateTitle(title, excludeId) {
        if (!title)
            return { isDuplicate: false };
        const existing = await this.repository.findByTitle(title);
        if (existing && (!excludeId || existing.fiscalYearID !== excludeId)) {
            return { isDuplicate: true };
        }
        return { isDuplicate: false };
    }
    async create(data, companyId = 2, branchId, agencyId) {
        if (data.title) {
            const existing = await this.repository.findByTitle(data.title);
            if (existing) {
                throw new common_1.BadRequestException(`سال مالی با عنوان ${data.title} از قبل وجود دارد.`);
            }
        }
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        this.validateDates(start, end);
        const entityData = {
            ...data,
            companyRef: companyId,
            startDate: start,
            endDate: end,
        };
        if (branchId !== undefined)
            entityData.branchRef = branchId;
        if (agencyId !== undefined)
            entityData.agencyRef = agencyId;
        return this.repository.create(entityData);
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.repository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.repository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Fiscal year with ID ${id} not found`);
        }
        return item;
    }
    async findByTitle(title) {
        return this.repository.findByTitle(title);
    }
    async update(id, data, companyId = 2, branchId, agencyId) {
        const item = await this.findOne(id);
        if (data.title) {
            const existing = await this.repository.findByTitle(data.title);
            if (existing && existing.fiscalYearID !== id) {
                throw new common_1.BadRequestException(`سال مالی با عنوان ${data.title} از قبل وجود دارد.`);
            }
        }
        const start = data.startDate ? new Date(data.startDate) : new Date(item.startDate);
        const end = data.endDate ? new Date(data.endDate) : new Date(item.endDate);
        if (data.startDate || data.endDate) {
            this.validateDates(start, end);
        }
        const entityData = { ...data };
        if (data.startDate)
            entityData.startDate = start;
        if (data.endDate)
            entityData.endDate = end;
        if (branchId !== undefined)
            entityData.branchRef = branchId;
        if (agencyId !== undefined)
            entityData.agencyRef = agencyId;
        return this.repository.update(id, entityData);
    }
    async remove(id) {
        return this.repository.delete(id);
    }
};
exports.FiscalYearService = FiscalYearService;
exports.FiscalYearService = FiscalYearService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('IFiscalYearRepository')),
    __metadata("design:paramtypes", [Object])
], FiscalYearService);
//# sourceMappingURL=fiscal-year.service.js.map