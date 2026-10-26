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
exports.DetailedAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const detailed_account_repository_interface_1 = require("../../domain/repositories/detailed-account.repository.interface");
let DetailedAccountService = class DetailedAccountService {
    constructor(detailedAccountRepository, dataSource) {
        this.detailedAccountRepository = detailedAccountRepository;
        this.dataSource = dataSource;
    }
    async create(createDto) {
        const isCodeDuplicated = await this.checkDuplicate('code', createDto.code);
        if (isCodeDuplicated)
            throw new common_1.BadRequestException('کد وارد شده قبلا ثبت شده است');
        const isTitleDuplicated = await this.checkDuplicate('title', createDto.title);
        if (isTitleDuplicated)
            throw new common_1.BadRequestException('عنوان وارد شده قبلا ثبت شده است');
        if (createDto.title_en) {
            const isTitleEnDuplicated = await this.checkDuplicate('title_en', createDto.title_en);
            if (isTitleEnDuplicated)
                throw new common_1.BadRequestException('عنوان لاتین وارد شده قبلا ثبت شده است');
        }
        const data = { ...createDto };
        return this.detailedAccountRepository.create(data);
    }
    async update(id, updateDto) {
        await this.findOne(id);
        if (updateDto.code) {
            const isCodeDuplicated = await this.checkDuplicate('code', updateDto.code, id);
            if (isCodeDuplicated)
                throw new common_1.BadRequestException('کد وارد شده قبلا ثبت شده است');
        }
        if (updateDto.title) {
            const isTitleDuplicated = await this.checkDuplicate('title', updateDto.title, id);
            if (isTitleDuplicated)
                throw new common_1.BadRequestException('عنوان وارد شده قبلا ثبت شده است');
        }
        if (updateDto.title_en) {
            const isTitleEnDuplicated = await this.checkDuplicate('title_en', updateDto.title_en, id);
            if (isTitleEnDuplicated)
                throw new common_1.BadRequestException('عنوان لاتین وارد شده قبلا ثبت شده است');
        }
        const data = { ...updateDto };
        return this.detailedAccountRepository.update(id, data);
    }
    async findAll() {
        return this.detailedAccountRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.detailedAccountRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const item = await this.detailedAccountRepository.findById(id);
        if (!item) {
            throw new common_1.NotFoundException(`DetailedAccount with ID ${id} not found`);
        }
        return item;
    }
    async remove(id, manager) {
        await this.removeMany([id], manager);
    }
    async removeMany(ids, manager) {
        if (manager) {
            await this.executeCleanup(ids, manager);
            return;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            await this.executeCleanup(ids, queryRunner.manager);
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async executeCleanup(ids, manager) {
        if (!ids || ids.length === 0)
            return;
        const getTableName = (schema, table) => {
            return `"${schema}"."${table}"`;
        };
        try {
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Rap', 'Cashes'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Cnt', 'Projects'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Cnt', 'Contracts'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Gnr', 'Parties'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Acc', 'CostCenter'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
            await manager.createQueryBuilder()
                .delete()
                .from(getTableName('Acc', 'DetailedAccounts'))
                .where('"DetailedAccountID" IN (:...ids)', { ids })
                .execute();
        }
        catch (error) {
            console.error('Error in executeCleanup:', error);
            throw new common_1.BadRequestException('حذف این حساب تفصیلی امکان پذیر نیست.');
        }
    }
    async checkDuplicate(field, value, excludeId) {
        return this.detailedAccountRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.DetailedAccountService = DetailedAccountService;
exports.DetailedAccountService = DetailedAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(detailed_account_repository_interface_1.IDetailedAccountRepositoryToken)),
    __metadata("design:paramtypes", [Object, typeorm_1.DataSource])
], DetailedAccountService);
//# sourceMappingURL=detailed-account.service.js.map