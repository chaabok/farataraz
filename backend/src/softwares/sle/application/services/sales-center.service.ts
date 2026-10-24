import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesCenterRepository, ISalesCenterRepositoryToken } from '../../domain/repositories/sales-center.repository.interface';
import { SalesCenter } from '../../domain/entities/sales-center.entity';
import { CreateSalesCenterDto, UpdateSalesCenterDto } from '../dtos/create-sales-center.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesCenterService {
  constructor(
    @Inject(ISalesCenterRepositoryToken)
    private readonly repository: ISalesCenterRepository,
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

  async findAll(): Promise<SalesCenter[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { BusinessStructureRef: bsId } : { CompanyRef: compId };
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<SalesCenter> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Sales center with ID ${id} not found`);
    }
    return item;
  }

  async getNextNumber(): Promise<{ documentNumber: number; isDocumentNumberAuto: boolean }> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.manager.createQueryBuilder(SalesCenter, 'sc');
    if (isShared) {
      qb.andWhere('sc.BusinessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('sc.CompanyRef = :compId', { compId });
    }
    const maxResult = await qb.select('MAX(sc.Code)', 'max').getRawOne();
    const max = maxResult?.max ? Number(maxResult.max) : 0;
    return {
      documentNumber: max + 1,
      isDocumentNumberAuto: false,
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (value === undefined || value === null || String(value).trim() === '') return false;
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(SalesCenter, 'sc');
    qb.where(`sc.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('sc.BusinessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('sc.CompanyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('sc.SalesCenterID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(dto: CreateSalesCenterDto): Promise<SalesCenter> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!dto.Code && dto.Code !== 0) {
      const nextNum = await this.getNextNumber();
      dto.Code = nextNum.documentNumber;
    }

    const rawTitle = dto.Title ?? (dto as any).title;
    const rawTitle2 = dto.Title2 ?? (dto as any).title2;
    if (rawTitle !== undefined && rawTitle !== null) {
      dto.Title = String(rawTitle).trim();
    }
    if (rawTitle2 !== undefined && rawTitle2 !== null && String(rawTitle2).trim() !== '') {
      dto.Title2 = String(rawTitle2).trim();
    } else {
      dto.Title2 = dto.Title;
    }

    if (!dto.Title || String(dto.Title).trim() === '') {
      throw new BadRequestException('فیلد عنوان اجباری است.');
    }

    if (await this.checkDuplicate('Code', dto.Code)) {
      const nextNum = await this.getNextNumber();
      dto.Code = nextNum.documentNumber;
      if (await this.checkDuplicate('Code', dto.Code)) {
        dto.Code = Date.now() % 100000;
      }
    }
    if (await this.checkDuplicate('Title', dto.Title)) {
      throw new BadRequestException('عنوان مرکز فروش تکراری است.');
    }

    const title2 = dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : dto.Title;
    const id = await this.idGenerationService.generateNextId('SalesCenters');

    const entity = this.repository.manager.create(SalesCenter, {
      SalesCenterID: id,
      Code: Number(dto.Code),
      Type: Number(dto.Type || 4),
      ReferenceRef: dto.ReferenceRef ? Number(dto.ReferenceRef) : undefined,
      Title: dto.Title,
      Title2: title2,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      Description: dto.Description || '',
      CreatorRef: userId,
      LastModifierRef: userId,
      CompanyRef: compId,
      BusinessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateSalesCenterDto): Promise<SalesCenter> {
    const existing = await this.findById(id);

    const rawTitle = dto.Title ?? (dto as any).title;
    const rawTitle2 = dto.Title2 ?? (dto as any).title2;

    if (rawTitle !== undefined) {
      dto.Title = rawTitle;
    }
    if (rawTitle2 !== undefined) {
      dto.Title2 = rawTitle2;
    }

    if ((dto as any).Code !== undefined && (dto as any).Code !== existing.Code) {
      if (await this.checkDuplicate('Code', (dto as any).Code, id)) {
        const nextNum = await this.getNextNumber();
        (dto as any).Code = nextNum.documentNumber;
        if (await this.checkDuplicate('Code', (dto as any).Code, id)) {
          (dto as any).Code = Date.now() % 100000;
        }
      }
    }
    if ((dto as any).Title !== undefined && (dto as any).Title !== existing.Title) {
      if (await this.checkDuplicate('Title', (dto as any).Title, id)) {
        throw new BadRequestException('عنوان مرکز فروش تکراری است.');
      }
    }

    const title2 = (dto as any).Title2 !== undefined 
      ? ((dto as any).Title2 && String((dto as any).Title2).trim() !== '' ? (dto as any).Title2 : ((dto as any).Title || existing.Title)) 
      : existing.Title2;

    const userId = this.requestContextService.getUserId() || 1;
    const updateData: Partial<SalesCenter> = {
      Code: (dto as any).Code !== undefined ? Number((dto as any).Code) : existing.Code,
      Type: (dto as any).Type !== undefined ? Number((dto as any).Type) : existing.Type,
      ReferenceRef: (dto as any).ReferenceRef !== undefined ? ((dto as any).ReferenceRef ? Number((dto as any).ReferenceRef) : undefined) : existing.ReferenceRef,
      Title: (dto as any).Title !== undefined ? (dto as any).Title : existing.Title,
      Title2: title2,
      IsActive: (dto as any).IsActive !== undefined ? (dto as any).IsActive : existing.IsActive,
      Description: (dto as any).Description !== undefined ? (dto as any).Description : existing.Description,
      LastModifierRef: userId,
    };

    return this.repository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
