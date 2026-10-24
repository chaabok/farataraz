import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { WarehouseDocumentType } from '../../domain/entities/warehouse-document-type.entity';
import { IWarehouseDocumentTypeRepository } from '../../domain/repositories/warehouse-document-type.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class WarehouseDocumentTypeRepository implements IWarehouseDocumentTypeRepository {
  constructor(
    @InjectRepository(WarehouseDocumentType)
    private readonly repository: Repository<WarehouseDocumentType>,
    private readonly requestContextService: RequestContextService
  ) {}

  get manager() {
    return this.repository.manager;
  }

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { [field]: value };

    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    if (excludeId) {
      where.WarehouseDocumentTypeID = Not(parseInt(excludeId as any, 10));
    }
    const count = await this.repository.count({ where });
    return count > 0;
  }

  async findAll(criteria?: any): Promise<WarehouseDocumentType[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = criteria?.where ? { ...criteria.where } : {};
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.find({ ...criteria, where, order: { WarehouseDocumentTypeCode: 'ASC' } });
  }

  async findById(id: number): Promise<WarehouseDocumentType | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { WarehouseDocumentTypeID: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.repository.findOne({ where });
  }

  async create(entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType> {
    const { bsId, compId } = await this.getScope();
    if (!entity.businessStructureRef || entity.businessStructureRef <= 1) entity.businessStructureRef = bsId;
    if (!entity.companyRef || entity.companyRef <= 1) entity.companyRef = compId;
    const newEntity = this.repository.create(entity);
    return this.repository.save(newEntity);
  }

  async update(id: number, entity: Partial<WarehouseDocumentType>): Promise<WarehouseDocumentType> {
    const existing = await this.repository.findOne({ where: { WarehouseDocumentTypeID: id } });
    if (!existing) {
      throw new Error('نوع سند انبار یافت نشد');
    }
    const merged = this.repository.merge(existing, entity);
    return this.repository.save(merged);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async calculateNextCode(bsId: number, companyId: number): Promise<{ nextValue: string; numberingMethod: string; error?: string }> {
    const { isShared } = await this.getScope();
    const where: any = {};
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = companyId;

    const hasWhere = Object.keys(where).length > 0;
    const lastList = await this.repository.find({
      ...(hasWhere ? { where } : {}),
      order: { WarehouseDocumentTypeCode: 'DESC' },
      take: 1,
    });
    const last = lastList.length > 0 ? lastList[0] : null;

    const nextVal = last && last.WarehouseDocumentTypeCode ? last.WarehouseDocumentTypeCode + 1 : 1;
    return {
      nextValue: String(nextVal),
      numberingMethod: '2',
    };
  }
}
