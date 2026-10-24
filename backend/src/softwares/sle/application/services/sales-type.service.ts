import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesTypeRepository, ISalesTypeRepositoryToken } from '../../domain/repositories/sales-type.repository.interface';
import { SalesType } from '../../domain/entities/sales-type.entity';
import { CreateSalesTypeDto, UpdateSalesTypeDto } from '../dtos/create-sales-type.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesTypeService {
  constructor(
    @Inject(ISalesTypeRepositoryToken)
    private readonly repository: ISalesTypeRepository,
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

  async findAll(): Promise<SalesType[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { BusinessStructureRef: bsId } : { CompanyRef: compId };
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<SalesType> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`SalesType with ID ${id} not found`);
    }
    return item;
  }

  async getNextCode(): Promise<{ code: number }> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.manager.createQueryBuilder(SalesType, 'st');
    if (isShared) {
      qb.andWhere('st.BusinessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('st.CompanyRef = :compId', { compId });
    }
    const maxResult = await qb.select('MAX(st.Code)', 'max').getRawOne();
    const max = maxResult?.max ? Number(maxResult.max) : 0;
    return { code: max + 1 };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (value === undefined || value === null || String(value).trim() === '') return false;
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(SalesType, 'st');
    qb.where(`st.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('st.BusinessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('st.CompanyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('st.SalesTypeID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(dto: CreateSalesTypeDto): Promise<SalesType> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!dto.Code && dto.Code !== 0) {
      const next = await this.getNextCode();
      dto.Code = next.code;
    }

    const rawTitle = dto.Title ?? (dto as any).title;
    const rawTitle2 = dto.Title2 ?? (dto as any).title2;

    if (!rawTitle || String(rawTitle).trim() === '') {
      throw new BadRequestException('فیلد عنوان الزامی است.');
    }
    const title = String(rawTitle).trim();
    // Requirement: if title2 is empty, default to title
    const title2 = rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== ''
      ? String(rawTitle2).trim()
      : title;

    if (await this.checkDuplicate('Code', dto.Code)) {
      const next = await this.getNextCode();
      dto.Code = next.code;
      if (await this.checkDuplicate('Code', dto.Code)) {
        dto.Code = Date.now() % 100000;
      }
    }
    if (await this.checkDuplicate('Title', title)) {
      throw new BadRequestException('عنوان نوع فروش تکراری است.');
    }

    const id = dto.SalesTypeID || (await this.idGenerationService.generateNextId('SalesTypes'));

    const entity = this.repository.manager.create(SalesType, {
      SalesTypeID: id,
      Code: Number(dto.Code),
      Title: title,
      Title2: title2,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      Description: dto.Description || '',
      CreatorRef: userId,
      CreationDate: new Date(),
      LastModifierRef: userId,
      LastModificationDate: new Date(),
      CompanyRef: compId,
      BusinessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateSalesTypeDto): Promise<SalesType> {
    const existing = await this.findById(id);
    const userId = this.requestContextService.getUserId() || 1;

    const rawTitle = dto.Title ?? existing.Title;
    const rawTitle2 = dto.Title2 ?? existing.Title2;

    const title = String(rawTitle).trim();
    // Requirement: if title2 is empty, default to title
    const title2 = rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== ''
      ? String(rawTitle2).trim()
      : title;

    if (dto.Code !== undefined && dto.Code !== existing.Code) {
      if (await this.checkDuplicate('Code', dto.Code, id)) {
        const next = await this.getNextCode();
        dto.Code = next.code;
      }
    }

    if (title !== existing.Title && (await this.checkDuplicate('Title', title, id))) {
      throw new BadRequestException('عنوان نوع فروش تکراری است.');
    }

    const updateData: Partial<SalesType> = {
      Code: dto.Code !== undefined ? Number(dto.Code) : existing.Code,
      Title: title,
      Title2: title2,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
      Description: dto.Description !== undefined ? dto.Description : existing.Description,
      LastModifierRef: userId,
      LastModificationDate: new Date(),
    };

    return this.repository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
