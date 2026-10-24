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
exports.RapReasonRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rap_reason_entity_1 = require("../../domain/entities/rap-reason.entity");
const account_entity_1 = require("../../../accounting/domain/entities/account.entity");
let RapReasonRepository = class RapReasonRepository {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        const newReason = this.repository.create(data);
        return await this.repository.save(newReason);
    }
    async findAll(authContext, isBasicInfoShared) {
        const qb = this.repository.createQueryBuilder('entity');
        qb.leftJoinAndMapOne('entity.AccountObj', account_entity_1.Account, 'account', 'entity.AccountRef = account.id');
        if (isBasicInfoShared) {
            qb.where('entity.businessStructureRef = :bsId', { bsId: authContext.businessStructureId });
        }
        else {
            qb.where('entity.companyRef = :cId', { cId: authContext.companyId });
        }
        return await qb.orderBy('entity.RapReasonID', 'ASC').getMany();
    }
    async findById(id, authContext, isBasicInfoShared) {
        const qb = this.repository.createQueryBuilder('entity');
        qb.leftJoinAndMapOne('entity.AccountObj', account_entity_1.Account, 'account', 'entity.AccountRef = account.id');
        qb.where('entity.RapReasonID = :id', { id });
        if (isBasicInfoShared) {
            qb.andWhere('entity.businessStructureRef = :bsId', { bsId: authContext.businessStructureId });
        }
        else {
            qb.andWhere('entity.companyRef = :cId', { cId: authContext.companyId });
        }
        return await qb.getOne();
    }
    async update(id, data) {
        await this.repository.update({ RapReasonID: id }, data);
        return (await this.repository.findOne({ where: { RapReasonID: id } }));
    }
    async delete(id) {
        await this.repository.delete({ RapReasonID: id });
    }
};
exports.RapReasonRepository = RapReasonRepository;
exports.RapReasonRepository = RapReasonRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rap_reason_entity_1.RapReason)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RapReasonRepository);
//# sourceMappingURL=rap-reason.repository.js.map