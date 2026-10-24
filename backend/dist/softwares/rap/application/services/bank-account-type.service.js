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
exports.BankAccountTypeService = void 0;
const common_1 = require("@nestjs/common");
const bank_account_type_repository_interface_1 = require("../../domain/repositories/bank-account-type.repository.interface");
const bank_account_type_entity_1 = require("../../domain/entities/bank-account-type.entity");
let BankAccountTypeService = class BankAccountTypeService {
    constructor(repository) {
        this.repository = repository;
    }
    async onModuleInit() {
        if (process.env.SYNC_DB === 'true') {
            try {
                await this.seedDefaults();
            }
            catch (e) {
                console.error('Failed to seed bank account types', e);
            }
        }
    }
    async seedDefaults() {
        const count = await this.repository.count();
        if (count === 0) {
            const defaults = [
                { code: 1, title: 'حساب جاری', latinTitle: 'Current Account' },
                { code: 2, title: 'قرض الحسنه', latinTitle: 'Qard al-Hasan' },
                { code: 3, title: 'سپرده کوتاه مدت', latinTitle: 'Short-term deposit' },
                { code: 4, title: 'سپرده بلندمدت', latinTitle: 'Long-term deposit' },
                { code: 5, title: 'سایر', latinTitle: 'Other' },
            ];
            for (const item of defaults) {
                const dto = {
                    code: item.code,
                    title: item.title,
                    latinTitle: item.latinTitle,
                    isActive: true
                };
                await this.create(dto);
            }
        }
    }
    async findAll() {
        return await this.repository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.repository.findAdvanced(params);
        return { items, total };
    }
    async findById(id) {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new common_1.NotFoundException(`BankAccountType with ID ${id} not found`);
        }
        return entity;
    }
    async create(dto) {
        const bat = new bank_account_type_entity_1.BankAccountType();
        if (!dto.bankAccountTypeId) {
            const maxId = await this.repository.getMaxId();
            bat.bankAccountTypeId = maxId + 1;
        }
        else {
            bat.bankAccountTypeId = dto.bankAccountTypeId;
        }
        bat.code = dto.code;
        bat.title = dto.title;
        if (dto.latinTitle !== undefined)
            bat.latinTitle = dto.latinTitle;
        if (dto.isActive !== undefined)
            bat.isActive = dto.isActive;
        return await this.repository.create(bat);
    }
    async update(id, dto) {
        const existing = await this.findById(id);
        if (dto.code !== undefined)
            existing.code = dto.code;
        if (dto.title !== undefined)
            existing.title = dto.title;
        if (dto.latinTitle !== undefined)
            existing.latinTitle = dto.latinTitle;
        if (dto.isActive !== undefined)
            existing.isActive = dto.isActive;
        return await this.repository.update(id, existing);
    }
    async delete(id) {
        await this.findById(id);
        await this.repository.delete(id);
    }
};
exports.BankAccountTypeService = BankAccountTypeService;
exports.BankAccountTypeService = BankAccountTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bank_account_type_repository_interface_1.IBankAccountTypeRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], BankAccountTypeService);
//# sourceMappingURL=bank-account-type.service.js.map