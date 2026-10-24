import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ISalesChannelRepository, ISalesChannelRepositoryToken } from '../../domain/repositories/sales-channel.repository.interface';
import { SalesChannel } from '../../domain/entities/sales-channel.entity';
import { CreateSalesChannelDto, UpdateSalesChannelDto } from '../dtos/create-sales-channel.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class SalesChannelService {
  constructor(
    @Inject(ISalesChannelRepositoryToken)
    private readonly repository: ISalesChannelRepository,
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

  async findAll(): Promise<SalesChannel[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<SalesChannel> {
    const channel = await this.repository.findById(id);
    if (!channel) {
      throw new NotFoundException(`Sales channel with ID ${id} not found`);
    }
    return channel;
  }

  async getNextNumber(): Promise<{ documentNumber: number; isDocumentNumberAuto: boolean }> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.manager.createQueryBuilder(SalesChannel, 'sc');
    if (isShared) {
      qb.andWhere('sc.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('sc.companyRef = :compId', { compId });
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

    const qb = this.repository.manager.createQueryBuilder(SalesChannel, 'sc');
    qb.where(`sc.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('sc.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('sc.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('sc.SalesChannelID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(dto: CreateSalesChannelDto): Promise<SalesChannel> {
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
    if (!dto.Type) {
      dto.Type = 1;
    }

    if (await this.checkDuplicate('Code', dto.Code)) {
      const nextNum = await this.getNextNumber();
      dto.Code = nextNum.documentNumber;
      if (await this.checkDuplicate('Code', dto.Code)) {
        dto.Code = Date.now() % 100000;
      }
    }
    if (await this.checkDuplicate('Title', dto.Title)) {
      throw new BadRequestException('عنوان کانال فروش تکراری است.');
    }

    const title2 = dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : dto.Title;
    const id = dto.SalesChannelID || (await this.idGenerationService.generateNextId('SalesChannels'));

    const entity = this.repository.manager.create(SalesChannel, {
      SalesChannelID: id,
      Code: Number(dto.Code),
      Title: dto.Title,
      Title2: title2,
      Type: Number(dto.Type),
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      Description: dto.Description || '',
      creator: userId,
      lastModifier: userId,
      companyRef: compId,
      businessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateSalesChannelDto): Promise<SalesChannel> {
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
        throw new BadRequestException('عنوان کانال فروش تکراری است.');
      }
    }

    const title2 = dto.Title2 !== undefined 
      ? (dto.Title2 && String(dto.Title2).trim() !== '' ? dto.Title2 : (dto.Title || existing.Title)) 
      : existing.Title2;

    const userId = this.requestContextService.getUserId() || 1;
    const updateData: Partial<SalesChannel> = {
      Code: dto.Code !== undefined ? Number(dto.Code) : existing.Code,
      Title: dto.Title !== undefined ? dto.Title : existing.Title,
      Title2: title2,
      Type: dto.Type !== undefined ? Number(dto.Type) : existing.Type,
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
