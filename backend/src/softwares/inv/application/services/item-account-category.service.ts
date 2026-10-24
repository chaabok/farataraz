import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IItemAccountCategoryRepository, IItemAccountCategoryRepositoryToken } from '../../domain/repositories/item-account-category.repository.interface';
import { ItemAccountCategory } from '../../domain/entities/item-account-category.entity';
import { CreateItemAccountCategoryDto } from '../dtos/create-item-account-category.dto';
import { UpdateItemAccountCategoryDto } from '../dtos/update-item-account-category.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ItemAccountCategoryService {
  constructor(
    @Inject(IItemAccountCategoryRepositoryToken)
    private readonly repository: IItemAccountCategoryRepository,
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

  async getItemsByCategory(categoryId: number): Promise<any[]> {
    const { bsId, compId, isShared } = await this.getScope();

    let whereClause = '';
    const params: any[] = [categoryId];

    if (isShared) {
      whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."BusinessStructureRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
      params.push(bsId);
    } else {
      whereClause = 'WHERE i."ItemAccountCategoryRef" = $1 AND i."CompanyRef" = $2 AND (i."IsActive" IS TRUE OR i."IsActive" IS NULL)';
      params.push(compId);
    }

    try {
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
      console.error('Error in getItemsByCategory:', err);
      return [];
    }
  }

  async updateCategoryItems(categoryId: number, items: any[]) {
    try {
      await this.repository.manager.connection.query(
        `UPDATE "Inv"."Items" SET "ItemAccountCategoryRef" = NULL WHERE "ItemAccountCategoryRef" = $1`,
        [categoryId]
      );

      if (items && Array.isArray(items) && items.length > 0) {
        const itemIds = items
          .map((i: any) => Number(i.ItemID || i.ItemRef || i))
          .filter((id: number) => !isNaN(id) && id > 0);

        if (itemIds.length > 0) {
          const cat = await this.repository.findById(categoryId);
          const catPricingMethod = cat?.PricingMethod || 1;
          await this.repository.manager.connection.query(
            `UPDATE "Inv"."Items" SET "ItemAccountCategoryRef" = $1, "PricingMethod" = $2 WHERE "ItemID" IN (${itemIds.join(',')})`,
            [categoryId, catPricingMethod]
          );
        }
      }
    } catch (err) {
      console.error('Error in updateCategoryItems:', err);
    }
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('طبقه حساب کالا یافت نشد');
    const items = await this.getItemsByCategory(id);
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

  private async validateDuplicates(dto: Partial<CreateItemAccountCategoryDto | UpdateItemAccountCategoryDto>, excludeId?: number) {
    if (dto.ItemAccountCategoryCode !== undefined) {
      const isDuplicateCode = await this.checkDuplicate('ItemAccountCategoryCode', dto.ItemAccountCategoryCode, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد طبقه حساب کالا تکراری است');
      }
    }
    
    if (dto.ItemAccountCategoryName !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('ItemAccountCategoryName', dto.ItemAccountCategoryName, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان طبقه حساب کالا تکراری است');
      }
    }
    
    if (dto.ItemAccountCategoryName2 !== undefined && dto.ItemAccountCategoryName2 !== null && dto.ItemAccountCategoryName2 !== '') {
      const isDuplicateTitle2 = await this.checkDuplicate('ItemAccountCategoryName2', dto.ItemAccountCategoryName2, excludeId);
      if (isDuplicateTitle2) {
        throw new BadRequestException('عنوان دوم طبقه حساب کالا تکراری است');
      }
    }
  }

  async create(createDto: CreateItemAccountCategoryDto): Promise<ItemAccountCategory> {
    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    let codeToSave = createDto.ItemAccountCategoryCode;
    
    const docRes = await this.repository.calculateNextCode(bsId, companyId);
    
    if (docRes.numberingMethod === '2' || !codeToSave) {
      if (docRes.error) {
        throw new BadRequestException(docRes.error);
      }
      codeToSave = parseInt(docRes.nextValue, 10);
    }

    createDto.ItemAccountCategoryCode = codeToSave;
    await this.validateDuplicates(createDto);

    const id = await this.idGenerationService.generateNextId('ItemAccountCategories');

    const { Items, ...dtoWithoutItems } = createDto as any;
    const entity = {
      ...dtoWithoutItems,
      ItemAccountCategoryCode: codeToSave,
      ItemAccountCategoryID: id,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId
    };
    const result = await this.repository.create(entity);
    if (Items && Array.isArray(Items)) {
      await this.updateCategoryItems(id, Items);
    }
    return result;
  }

  async update(id: number, updateDto: UpdateItemAccountCategoryDto): Promise<ItemAccountCategory> {
    const existing = await this.findOne(id);
    
    if (updateDto.ItemAccountCategoryCode === undefined) {
       (updateDto as any).ItemAccountCategoryCode = existing.ItemAccountCategoryCode;
    }
    
    await this.validateDuplicates(updateDto, id);
    
    const userId = this.requestContextService.getUserId();
    const { Items, ...dtoWithoutItems } = updateDto as any;
    const entityToUpdate = {
      ...dtoWithoutItems,
      lastModifier: userId || 1,
    };
    const result = await this.repository.update(id, entityToUpdate);
    if (result && updateDto.PricingMethod !== undefined) {
      await this.repository.manager.connection.query(
        `UPDATE "Inv"."Items" SET "PricingMethod" = $1 WHERE "ItemAccountCategoryRef" = $2`,
        [updateDto.PricingMethod, id]
      );
    }
    if (Items && Array.isArray(Items)) {
      await this.updateCategoryItems(id, Items);
    }
    return result;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
