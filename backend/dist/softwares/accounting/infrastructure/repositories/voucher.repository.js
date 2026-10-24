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
exports.VoucherRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const voucher_entity_1 = require("../../domain/entities/voucher.entity");
const voucher_type_entity_1 = require("../../domain/entities/voucher-type.entity");
const account_entity_1 = require("../../domain/entities/account.entity");
const detailed_account_entity_1 = require("../../domain/entities/detailed-account.entity");
const accounts_related_detailed_account_entity_1 = require("../../domain/entities/accounts-related-detailed-account.entity");
const user_entity_1 = require("../../../../core/iam/entities/user.entity");
let VoucherRepository = class VoucherRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }
    async update(id, data) {
        await this.repository.update({ voucherId: id }, data);
        return this.findById(id);
    }
    async delete(id) {
        await this.repository.delete({ voucherId: id });
    }
    async findById(id) {
        const voucher = await this.repository.findOne({ where: { voucherId: id }, relations: ['items'] });
        if (!voucher)
            return null;
        if (voucher.creator) {
            const creatorUser = await this.repository.manager.findOne(user_entity_1.User, { where: { id: voucher.creator } });
            if (creatorUser) {
                voucher['creatorName'] = `${creatorUser.firstName || ''} ${creatorUser.lastName || ''}`.trim() || creatorUser.username;
            }
        }
        if (voucher.voucherTypeId) {
            voucher['voucherType'] = await this.repository.manager.findOne(voucher_type_entity_1.VoucherType, { where: { voucherTypeId: voucher.voucherTypeId } });
        }
        if (voucher.items && voucher.items.length > 0) {
            for (const item of voucher.items) {
                if (item.accountId) {
                    item['account'] = await this.repository.manager.findOne(account_entity_1.Account, {
                        where: { id: item.accountId },
                        relations: ['parent', 'parent.parent']
                    });
                    if (item['account']) {
                        item['account'].relatedDetailedAccounts = await this.repository.manager.find(accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, { where: { accountId: item.accountId }, relations: ['detailedType'] });
                    }
                }
                if (item.detailedAccountId1) {
                    item['detailedAccount1'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId1 } });
                }
                if (item.detailedAccountId2) {
                    item['detailedAccount2'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId2 } });
                }
                if (item.detailedAccountId3) {
                    item['detailedAccount3'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId3 } });
                }
                if (item.detailedAccountId4) {
                    item['detailedAccount4'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId4 } });
                }
                if (item.detailedAccountId5) {
                    item['detailedAccount5'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId5 } });
                }
                if (item.detailedAccountId6) {
                    item['detailedAccount6'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId6 } });
                }
                if (item.detailedAccountId7) {
                    item['detailedAccount7'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId7 } });
                }
                if (item.detailedAccountId8) {
                    item['detailedAccount8'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId8 } });
                }
                if (item.detailedAccountId9) {
                    item['detailedAccount9'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId9 } });
                }
                if (item.detailedAccountId10) {
                    item['detailedAccount10'] = await this.repository.manager.findOne(detailed_account_entity_1.DetailedAccount, { where: { detailedAccountId: item.detailedAccountId10 } });
                }
            }
        }
        return voucher;
    }
    async findAll(companyId) {
        const where = {};
        if (companyId) {
            where.companyRef = companyId;
        }
        const vouchers = await this.repository.find({
            where,
            order: { voucherDate: 'DESC', voucherId: 'DESC' }
        });
        for (const voucher of vouchers) {
            if (voucher.creator) {
                const creatorUser = await this.repository.manager.findOne(user_entity_1.User, { where: { id: voucher.creator } });
                if (creatorUser) {
                    voucher['creatorName'] = `${creatorUser.firstName || ''} ${creatorUser.lastName || ''}`.trim() || creatorUser.username;
                }
            }
            if (voucher.voucherTypeId) {
                const vt = await this.repository.manager.findOne(voucher_type_entity_1.VoucherType, { where: { voucherTypeId: voucher.voucherTypeId } });
                if (vt) {
                    voucher['voucherTypeTitle'] = vt.title;
                }
            }
        }
        return vouchers;
    }
};
exports.VoucherRepository = VoucherRepository;
exports.VoucherRepository = VoucherRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(voucher_entity_1.Voucher)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], VoucherRepository);
//# sourceMappingURL=voucher.repository.js.map