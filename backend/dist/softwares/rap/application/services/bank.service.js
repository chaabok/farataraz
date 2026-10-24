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
exports.BankService = void 0;
const common_1 = require("@nestjs/common");
const bank_repository_interface_1 = require("../../domain/repositories/bank.repository.interface");
let BankService = class BankService {
    constructor(bankRepository) {
        this.bankRepository = bankRepository;
    }
    async create(createDto) {
        await this.validateDuplicates(createDto);
        return this.bankRepository.create(createDto);
    }
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        await this.validateDuplicates(updateDto, id);
        await this.bankRepository.update(id, updateDto);
        return this.findOne(id);
    }
    async findAll() {
        return this.bankRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.bankRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.bankRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`Bank with ID ${id} not found`);
        }
        return item;
    }
    async remove(id) {
        await this.findOne(id);
        await this.bankRepository.delete(id);
    }
    async checkDuplicate(field, value, excludeId) {
        return this.bankRepository.checkDuplicate(field, value, excludeId);
    }
    async validateDuplicates(dto, excludeId) {
        if (dto.code !== undefined) {
            const isDuplicateCode = await this.checkDuplicate('code', dto.code, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException('کد بانک تکراری است');
            }
        }
        if (dto.title !== undefined) {
            const isDuplicateTitle = await this.checkDuplicate('title', dto.title, excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان بانک تکراری است');
            }
        }
        if (dto.latinTitle !== undefined && dto.latinTitle !== null && dto.latinTitle !== '') {
            const isDuplicateLatinTitle = await this.checkDuplicate('latinTitle', dto.latinTitle, excludeId);
            if (isDuplicateLatinTitle) {
                throw new common_1.BadRequestException('عنوان لاتین بانک تکراری است');
            }
        }
    }
};
exports.BankService = BankService;
exports.BankService = BankService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bank_repository_interface_1.IBankRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], BankService);
//# sourceMappingURL=bank.service.js.map