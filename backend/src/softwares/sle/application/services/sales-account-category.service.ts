import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesAccountCategoryRepository, ISalesAccountCategoryRepositoryToken } from '../../domain/repositories/sales-account-category.repository.interface';
import { SalesAccountCategory } from '../../domain/entities/sales-account-category.entity';
import { CreateSalesAccountCategoryDto } from '../dtos/create-sales-account-category.dto';
import { UpdateSalesAccountCategoryDto } from '../dtos/update-sales-account-category.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesAccountCategoryService {
  constructor(
    @Inject(ISalesAccountCategoryRepositoryToken)
    private readonly repository: ISalesAccountCategoryRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

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

  async findAll(query: any): Promise<any> {
    const { skip, take } = query;
    const { bsId, compId, isShared } = await this.getScope();
    
    let where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    const [data, total] = await Promise.all([
      this.repository.findAll({ where, skip: skip ? parseInt(skip) : undefined, take: take ? parseInt(take) : undefined }),
      this.repository.count({ where })
    ]);
    return { data, total, success: true };
  }

  async getItemsByGroup(groupId: number): Promise<any[]> {
    const { bsId, compId, isShared } = await this.getScope();

    let whereClause = '';
    const params: any[] = [groupId];

    if (isShared) {
      whereClause = 'WHERE i."SalesAccountCategoryRef" = $1 AND i."BusinessStructureRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
      params.push(bsId);
    } else {
      whereClause = 'WHERE i."SalesAccountCategoryRef" = $1 AND i."CompanyRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
      params.push(compId);
    }

    try {
      await this.repository.manager.connection.query(`ALTER TABLE "Inv"."Items" ADD COLUMN IF NOT EXISTS "SalesAccountCategoryRef" bigint;`).catch(() => {});

      const rows = await this.repository.manager.connection.query(
        `SELECT 
          i."ItemID",
          i."ItemCode",
          i."ItemName",
          i."ItemName2",
          i."MeasurementUnitRef",
          mu."MeasurementUnitName" AS "MeasurementUnitName"
         FROM "Inv"."Items" i
         LEFT JOIN "Inv"."MeasurementUnits" mu ON mu."MeasurementUnitID" = i."MeasurementUnitRef"
         ${whereClause}
         ORDER BY i."ItemCode" ASC, i."ItemID" ASC`,
        params
      );

      return (rows || []).map((r: any) => ({
        ItemID: Number(r.ItemID),
        ItemRef: Number(r.ItemID),
        ItemCode: r.ItemCode !== null && r.ItemCode !== undefined ? String(r.ItemCode) : '',
        ItemName: r.ItemName || '',
        ItemName2: r.ItemName2 || '',
        MeasurementUnitRef: r.MeasurementUnitRef ? Number(r.MeasurementUnitRef) : null,
        MeasurementUnitName: r.MeasurementUnitName || '',
      }));
    } catch (err) {
      console.error('Error in getItemsByGroup:', err);
      return [];
    }
  }

  async updateGroupItems(groupId: number, items: any[]) {
    try {
      await this.repository.manager.connection.query(`ALTER TABLE "Inv"."Items" ADD COLUMN IF NOT EXISTS "SalesAccountCategoryRef" bigint;`).catch(() => {});

      await this.repository.manager.connection.query(
        `UPDATE "Inv"."Items" SET "SalesAccountCategoryRef" = NULL WHERE "SalesAccountCategoryRef" = $1`,
        [groupId]
      );

      if (items && Array.isArray(items) && items.length > 0) {
        const itemIds = items
          .map((i: any) => Number(i.ItemID || i.ItemRef || i))
          .filter((id: number) => !isNaN(id) && id > 0);

        if (itemIds.length > 0) {
          await this.repository.manager.connection.query(
            `UPDATE "Inv"."Items" SET "SalesAccountCategoryRef" = $1 WHERE "ItemID" IN (${itemIds.join(',')})`,
            [groupId]
          );
        }
      }
    } catch (err) {
      console.error('Error in updateGroupItems:', err);
    }
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('طبقه حساب فروش یافت نشد');
    const items = await this.getItemsByGroup(id);
    return {
      ...entity,
      Items: items,
    };
  }

  async getNextNumber(): Promise<{ documentNumber: string, isDocumentNumberAuto: boolean, error?: string }> {
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const res = await this.repository.calculateNextCode(bsId, companyId);
    
    return {
      documentNumber: res.nextValue,
      isDocumentNumberAuto: res.numberingMethod === '2',
      error: res.error,
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.repository.checkDuplicate(field, value, excludeId);
  }

  private async validateDuplicates(dto: any, excludeId?: number) {
    if (dto.SalesAccountCategoryCode !== undefined) {
      const isDuplicateCode = await this.checkDuplicate('SalesAccountCategoryCode', dto.SalesAccountCategoryCode, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد طبقه حساب فروش تکراری است');
      }
    }
    
    if (dto.SalesAccountCategoryName !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('SalesAccountCategoryName', dto.SalesAccountCategoryName, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان طبقه حساب فروش تکراری است');
      }
    }
    
    if (dto.SalesAccountCategoryName2 !== undefined && dto.SalesAccountCategoryName2 !== null && dto.SalesAccountCategoryName2 !== '') {
      const isDuplicateTitle2 = await this.checkDuplicate('SalesAccountCategoryName2', dto.SalesAccountCategoryName2, excludeId);
      if (isDuplicateTitle2) {
        throw new BadRequestException('عنوان دوم طبقه حساب فروش تکراری است');
      }
    }
  }

  async create(createDto: CreateSalesAccountCategoryDto): Promise<SalesAccountCategory> {
    if (!createDto.CurrencyRef) {
      throw new BadRequestException('انتخاب ارز اجباری است');
    }
    if (!createDto.SalesAccountCategoryName2 || String(createDto.SalesAccountCategoryName2).trim() === '') {
      createDto.SalesAccountCategoryName2 = createDto.SalesAccountCategoryName;
    }
    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    let codeToSave = createDto.SalesAccountCategoryCode;
    
    const docRes = await this.repository.calculateNextCode(bsId, companyId);
    
    if (docRes.numberingMethod === '2' || !codeToSave) {
      if (docRes.error) {
        throw new BadRequestException(docRes.error);
      }
      codeToSave = parseInt(docRes.nextValue, 10);
    }

    createDto.SalesAccountCategoryCode = codeToSave;
    await this.validateDuplicates(createDto);

    const id = await this.idGenerationService.generateNextId('SalesAccountCategories');

    const { Items, ...dtoWithoutItems } = createDto as any;
    const entity = {
      ...dtoWithoutItems,
      SalesAccountCategoryCode: codeToSave,
      SalesAccountCategoryID: id,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId
    };
    const result = await this.repository.create(entity);
    if (Items && Array.isArray(Items)) {
      await this.updateGroupItems(id, Items);
    }
    return result;
  }

  async update(id: number, updateDto: UpdateSalesAccountCategoryDto): Promise<SalesAccountCategory> {
    if (updateDto.CurrencyRef !== undefined && !updateDto.CurrencyRef) {
      throw new BadRequestException('انتخاب ارز اجباری است');
    }
    const existing = await this.findOne(id);
    
    if (updateDto.SalesAccountCategoryName2 !== undefined && (!updateDto.SalesAccountCategoryName2 || String(updateDto.SalesAccountCategoryName2).trim() === '')) {
      updateDto.SalesAccountCategoryName2 = updateDto.SalesAccountCategoryName || existing.SalesAccountCategoryName;
    }
    
    if (updateDto.SalesAccountCategoryCode === undefined) {
       (updateDto as any).SalesAccountCategoryCode = existing.SalesAccountCategoryCode;
    }
    
    await this.validateDuplicates(updateDto, id);
    
    const userId = this.requestContextService.getUserId();
    const { Items, ...dtoWithoutItems } = updateDto as any;
    const entityToUpdate = {
      ...dtoWithoutItems,
      lastModifier: userId || 1,
    };
    const result = await this.repository.update(id, entityToUpdate);
    if (Items && Array.isArray(Items)) {
      await this.updateGroupItems(id, Items);
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
