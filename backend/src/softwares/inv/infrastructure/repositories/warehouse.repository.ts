import { Injectable } from '@nestjs/common';
import { DataSource, Repository, IsNull } from 'typeorm';
import { Warehouse } from '../../domain/entities/warehouse.entity';
import { WarehouseProduct } from '../../domain/entities/warehouse-product.entity';
import { WarehouseUser } from '../../domain/entities/warehouse-user.entity';
import { WarehouseAddress } from '../../domain/entities/warehouse-address.entity';
import { WarehouseKeeper } from '../../domain/entities/warehouse-keeper.entity';
import { IWarehouseRepository } from '../../domain/repositories/warehouse.repository.interface';
import { EntityNumbering } from '../../../common/domain/entities/entity-numbering.entity';

@Injectable()
export class WarehouseRepository implements IWarehouseRepository {
  private repository: Repository<Warehouse>;

  constructor(private dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Warehouse);
  }

  private async isBasicInfoShared(bsId: number): Promise<boolean> {
    try {
      const rows = await this.dataSource.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          return false;
        }
        return true;
      }
    } catch (err) {}
    return false;
  }

  async findAll(businessStructureRef?: number, companyRef?: number): Promise<Warehouse[]> {
    let isShared = false;
    if (businessStructureRef && businessStructureRef > 0) {
      isShared = await this.isBasicInfoShared(businessStructureRef);
    }

    const where: any = {};
    if (isShared && businessStructureRef) {
      where.businessStructureRef = businessStructureRef;
    } else if (companyRef && companyRef > 0) {
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

  async findById(id: number, businessStructureRef: number, companyRef: number): Promise<Warehouse | null> {
    const isShared = await this.isBasicInfoShared(businessStructureRef);

    const where: any = { WarehouseID: id };
    if (isShared) where.businessStructureRef = businessStructureRef;
    else where.companyRef = companyRef;

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

  async create(data: Partial<Warehouse>): Promise<Warehouse> {
    if (!data.businessStructureRef || data.businessStructureRef <= 1) data.businessStructureRef = 2;
    if (!data.companyRef || data.companyRef <= 1) data.companyRef = 2;
    const warehouse = this.repository.create(data);
    return this.repository.save(warehouse);
  }

  async update(id: number, data: Partial<Warehouse>): Promise<Warehouse> {
    if (data.WarehouseProducts !== undefined) {
      await this.dataSource.getRepository(WarehouseProduct).delete({ WarehouseRef: id });
    }
    if (data.WarehouseUsers !== undefined) {
      await this.dataSource.getRepository(WarehouseUser).delete({ WarehouseRef: id });
    }
    if (data.WarehouseAddresses !== undefined) {
      await this.dataSource.getRepository(WarehouseAddress).delete({ WarehouseRef: id });
    }
    if (data.WarehouseKeepers !== undefined) {
      await this.dataSource.getRepository(WarehouseKeeper).delete({ WarehouseRef: id });
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
    }) as Promise<Warehouse>;
  }

  async remove(id: number): Promise<void> {
    await this.repository.delete(id);
  }
  
  async countChildren(parentId: number): Promise<number> {
    return this.repository.count({ where: { ParentRef: parentId } });
  }

  async calculateNextCode(businessStructureId: number, companyId: number): Promise<{ numberingMethod: string; nextValue: string; error?: string }> {
    const manager = this.dataSource.manager;
    const isShared = await this.isBasicInfoShared(businessStructureId);

    let config = await manager.getRepository(EntityNumbering).findOne({
      where: {
        entityRef: 'warehouse',
        companyRef: companyId,
      }
    });

    if (!config) {
      config = await manager.getRepository(EntityNumbering).findOne({
        where: {
          entityRef: 'warehouse',
          businessStructureRef: businessStructureId,
        }
      });
    }

    let numberingMethod = '2'; // 1 = manual, 2 = automatic
    let items: any = null;

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
        } else {
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

  async checkDuplicate(
    field: 'WarehouseCode' | 'WarehouseTitle' | 'WarehouseTitle2',
    value: string,
    businessStructureRef: number,
    companyRef: number,
    excludeId?: number,
  ): Promise<boolean> {
    if (!value || !value.trim()) return false;

    const isShared = await this.isBasicInfoShared(businessStructureRef);

    const qb = this.repository.createQueryBuilder('w');

    if (isShared) {
      qb.where('w.businessStructureRef = :bsId', { bsId: businessStructureRef });
    } else {
      qb.where('w.companyRef = :compId', { compId: companyRef });
    }

    qb.andWhere(`TRIM(w.${field}) = :val`, { val: value.trim() });

    if (excludeId) {
      qb.andWhere('w.WarehouseID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }
}
