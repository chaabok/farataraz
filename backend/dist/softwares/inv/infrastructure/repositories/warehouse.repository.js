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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const warehouse_entity_1 = require("../../domain/entities/warehouse.entity");
const warehouse_product_entity_1 = require("../../domain/entities/warehouse-product.entity");
const warehouse_user_entity_1 = require("../../domain/entities/warehouse-user.entity");
const warehouse_address_entity_1 = require("../../domain/entities/warehouse-address.entity");
const warehouse_keeper_entity_1 = require("../../domain/entities/warehouse-keeper.entity");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
let WarehouseRepository = class WarehouseRepository {
    constructor(dataSource) {
        this.dataSource = dataSource;
        this.repository = this.dataSource.getRepository(warehouse_entity_1.Warehouse);
    }
    async isBasicInfoShared(bsId) {
        try {
            const rows = await this.dataSource.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    return false;
                }
                return true;
            }
        }
        catch (err) { }
        return false;
    }
    async findAll(businessStructureRef, companyRef) {
        let isShared = false;
        if (businessStructureRef && businessStructureRef > 0) {
            isShared = await this.isBasicInfoShared(businessStructureRef);
        }
        const where = {};
        if (isShared && businessStructureRef) {
            where.businessStructureRef = businessStructureRef;
        }
        else if (companyRef && companyRef > 0) {
            where.companyRef = companyRef;
        }
        return this.repository.find({
            where,
            relations: [
                'Parent',
                'WarehouseUsers',
                'WarehouseUsers.User',
                'WarehouseProducts',
                'WarehouseAddresses',
                'WarehouseKeepers',
            ],
            order: { WarehouseCode: 'ASC' },
        });
    }
    async findById(id, businessStructureRef, companyRef) {
        const isShared = await this.isBasicInfoShared(businessStructureRef);
        const where = { WarehouseID: id };
        if (isShared)
            where.businessStructureRef = businessStructureRef;
        else
            where.companyRef = companyRef;
        return this.repository.findOne({
            where,
            relations: [
                'DetailedAccount',
                'Parent',
                'WarehouseKeeper',
                'WarehouseProducts',
                'WarehouseProducts.MeasurementUnit',
                'WarehouseUsers',
                'WarehouseUsers.User',
                'WarehouseAddresses',
                'WarehouseKeepers',
                'WarehouseKeepers.WarehouseKeeper'
            ],
        });
    }
    async create(data) {
        if (!data.businessStructureRef || data.businessStructureRef <= 1)
            data.businessStructureRef = 2;
        if (!data.companyRef || data.companyRef <= 1)
            data.companyRef = 2;
        const warehouse = this.repository.create(data);
        return this.repository.save(warehouse);
    }
    async update(id, data) {
        if (data.WarehouseProducts !== undefined) {
            await this.dataSource.getRepository(warehouse_product_entity_1.WarehouseProduct).delete({ WarehouseRef: id });
        }
        if (data.WarehouseUsers !== undefined) {
            await this.dataSource.getRepository(warehouse_user_entity_1.WarehouseUser).delete({ WarehouseRef: id });
        }
        if (data.WarehouseAddresses !== undefined) {
            await this.dataSource.getRepository(warehouse_address_entity_1.WarehouseAddress).delete({ WarehouseRef: id });
        }
        if (data.WarehouseKeepers !== undefined) {
            await this.dataSource.getRepository(warehouse_keeper_entity_1.WarehouseKeeper).delete({ WarehouseRef: id });
        }
        const existing = await this.repository.findOne({ where: { WarehouseID: id } });
        if (!existing) {
            throw new Error(`Warehouse with ID ${id} not found`);
        }
        this.repository.merge(existing, data);
        await this.repository.save(existing);
        return this.repository.findOne({
            where: { WarehouseID: id },
            relations: [
                'DetailedAccount',
                'Parent',
                'WarehouseKeeper',
                'WarehouseProducts',
                'WarehouseProducts.MeasurementUnit',
                'WarehouseUsers',
                'WarehouseUsers.User',
                'WarehouseAddresses',
                'WarehouseKeepers',
                'WarehouseKeepers.WarehouseKeeper'
            ]
        });
    }
    async remove(id) {
        await this.repository.delete(id);
    }
    async countChildren(parentId) {
        return this.repository.count({ where: { ParentRef: parentId } });
    }
    async calculateNextCode(businessStructureId, companyId) {
        const manager = this.dataSource.manager;
        const isShared = await this.isBasicInfoShared(businessStructureId);
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'warehouse',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'warehouse',
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let items = null;
        if (config) {
            numberingMethod = config.numberingMethod || '2';
            items = config.items;
        }
        let startNumber = 1;
        let endNumber = 999999;
        let fixedChar = '';
        if (items) {
            let fYears = items.fiscalYears || [];
            if (Array.isArray(items)) {
                fYears = items;
            }
            if (fYears.length > 0) {
                startNumber = parseInt(fYears[0].startNumber || '1', 10);
                endNumber = parseInt(fYears[0].endNumber || '999999', 10);
                fixedChar = fYears[0].fixedChar || '';
            }
        }
        const whereCondition = isShared
            ? { businessStructureRef: businessStructureId }
            : { companyRef: companyId };
        const allWarehouses = await this.repository.find({
            where: whereCondition
        });
        const usedCodes = new Set(allWarehouses.map(w => (w.WarehouseCode || '').toString().trim()));
        let maxNum = 0;
        for (const w of allWarehouses) {
            if (w.WarehouseCode) {
                const valStr = String(w.WarehouseCode).trim();
                let num = 0;
                if (fixedChar && valStr.startsWith(fixedChar)) {
                    num = parseInt(valStr.slice(fixedChar.length), 10);
                }
                else {
                    const match = valStr.match(/\d+/);
                    if (match) {
                        num = parseInt(match[0], 10);
                    }
                }
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        }
        let nextSeq = Math.max(startNumber, maxNum + 1);
        while (usedCodes.has((fixedChar || '') + String(nextSeq))) {
            nextSeq++;
        }
        if (nextSeq > endNumber) {
            return {
                numberingMethod,
                nextValue: '',
                error: `شماره تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری تجاوز کرده است.`
            };
        }
        const formatted = String(fixedChar || '') + String(nextSeq);
        return { numberingMethod, nextValue: formatted };
    }
    async checkDuplicate(field, value, businessStructureRef, companyRef, excludeId) {
        if (!value || !value.trim())
            return false;
        const isShared = await this.isBasicInfoShared(businessStructureRef);
        const qb = this.repository.createQueryBuilder('w');
        if (isShared) {
            qb.where('w.businessStructureRef = :bsId', { bsId: businessStructureRef });
        }
        else {
            qb.where('w.companyRef = :compId', { compId: companyRef });
        }
        qb.andWhere(`TRIM(w.${field}) = :val`, { val: value.trim() });
        if (excludeId) {
            qb.andWhere('w.WarehouseID != :excludeId', { excludeId });
        }
        const count = await qb.getCount();
        return count > 0;
    }
};
exports.WarehouseRepository = WarehouseRepository;
exports.WarehouseRepository = WarehouseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], WarehouseRepository);
//# sourceMappingURL=warehouse.repository.js.map