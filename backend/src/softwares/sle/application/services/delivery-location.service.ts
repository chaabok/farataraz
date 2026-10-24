import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IDeliveryLocationRepository, IDeliveryLocationRepositoryToken } from '../../domain/repositories/delivery-location.repository.interface';
import { DeliveryLocation } from '../../domain/entities/delivery-location.entity';
import { CreateDeliveryLocationDto, UpdateDeliveryLocationDto } from '../dtos/create-delivery-location.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class DeliveryLocationService {
  constructor(
    @Inject(IDeliveryLocationRepositoryToken)
    private readonly repository: IDeliveryLocationRepository,
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

  async findAll(activeOnly?: boolean): Promise<DeliveryLocation[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: Record<string, any> = isShared
      ? { businessStructureRef: bsId }
      : { companyRef: compId };
    // Only active delivery locations (for dropdowns like sales order)
    if (activeOnly) {
      where.IsActive = true;
    }
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<DeliveryLocation> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new NotFoundException(`Delivery location with ID ${id} not found`);
    }
    return item;
  }

  async getNextNumber(): Promise<{ documentNumber: number; isDocumentNumberAuto: boolean }> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.manager.createQueryBuilder(DeliveryLocation, 'dl');
    if (isShared) {
      qb.andWhere('dl.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('dl.companyRef = :compId', { compId });
    }
    const maxResult = await qb.select('MAX(dl.Code)', 'max').getRawOne();
    const max = maxResult?.max ? Number(maxResult.max) : 0;
    return {
      documentNumber: max + 1,
      isDocumentNumberAuto: false,
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (value === undefined || value === null || String(value).trim() === '') return false;
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(DeliveryLocation, 'dl');
    qb.where(`dl.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('dl.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('dl.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('dl.DeliveryLocationID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(dto: CreateDeliveryLocationDto): Promise<DeliveryLocation> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!dto.Code && dto.Code !== 0) {
      const nextNum = await this.getNextNumber();
      dto.Code = nextNum.documentNumber;
    }
    const rawTitle = dto.Title ?? (dto as any).title ?? (dto as any).TITLE;
    const rawTitle2 = dto.Title2 ?? (dto as any).title2 ?? (dto as any).TITLE2;
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
      throw new BadRequestException('عنوان مکان تحویل تکراری است.');
    }

    const title2 = dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : dto.Title;
    const id = dto.DeliveryLocationID || (await this.idGenerationService.generateNextId('DeliveryLocations'));

    const entity = this.repository.manager.create(DeliveryLocation, {
      DeliveryLocationID: id,
      Code: Number(dto.Code),
      Title: dto.Title,
      Title2: title2,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      Description: dto.Description || '',
      creator: userId,
      lastModifier: userId,
      companyRef: compId,
      businessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateDeliveryLocationDto): Promise<DeliveryLocation> {
    const existing = await this.findById(id);

    const rawTitle = dto.Title ?? (dto as any).title ?? (dto as any).TITLE;
    const rawTitle2 = dto.Title2 ?? (dto as any).title2 ?? (dto as any).TITLE2;

    if (rawTitle !== undefined) {
      dto.Title = rawTitle;
    }
    if (rawTitle2 !== undefined) {
      dto.Title2 = rawTitle2;
    }

    if (dto.Code !== undefined && dto.Code !== existing.Code) {
      if (await this.checkDuplicate('Code', dto.Code, id)) {
        const nextNum = await this.getNextNumber();
        dto.Code = nextNum.documentNumber;
        if (await this.checkDuplicate('Code', dto.Code, id)) {
          dto.Code = Date.now() % 100000;
        }
      }
    }
    if (dto.Title !== undefined && dto.Title !== existing.Title) {
      if (await this.checkDuplicate('Title', dto.Title, id)) {
        throw new BadRequestException('عنوان مکان تحویل تکراری است.');
      }
    }

    const title2 = dto.Title2 !== undefined 
      ? (dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : (dto.Title || existing.Title)) 
      : existing.Title2;

    const userId = this.requestContextService.getUserId() || 1;
    const updateData: Partial<DeliveryLocation> = {
      Code: dto.Code !== undefined ? Number(dto.Code) : existing.Code,
      Title: dto.Title !== undefined ? dto.Title : existing.Title,
      Title2: title2,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : existing.IsActive,
      Description: dto.Description !== undefined ? dto.Description : existing.Description,
      lastModifier: userId,
    };

    return this.repository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
