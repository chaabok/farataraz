import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWarehouseDocumentTypeRepository, IWarehouseDocumentTypeRepositoryToken } from '../../domain/repositories/warehouse-document-type.repository.interface';
import { WarehouseDocumentType } from '../../domain/entities/warehouse-document-type.entity';
import { CreateWarehouseDocumentTypeDto } from '../dtos/create-warehouse-document-type.dto';
import { UpdateWarehouseDocumentTypeDto } from '../dtos/update-warehouse-document-type.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class WarehouseDocumentTypeService {
  constructor(
    @Inject(IWarehouseDocumentTypeRepositoryToken)
    private readonly repository: IWarehouseDocumentTypeRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async findAll(query: any): Promise<any> {
    let data = await this.repository.findAll();
    if (query && (query.nature !== undefined || query.WarehouseDocumentNature !== undefined)) {
      const targetNature = Number(query.nature ?? query.WarehouseDocumentNature);
      if (!isNaN(targetNature)) {
        data = data.filter((item: any) => Number(item.WarehouseDocumentNature) === targetNature);
      }
    }
    return { data, total: data.length, success: true };
  }

  async findOne(id: number): Promise<WarehouseDocumentType> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('نوع سند انبار یافت نشد');
    return entity;
  }

  async getNextNumber(): Promise<{ documentNumber: string; isDocumentNumberAuto: boolean; error?: string }> {
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

  private async validateFields(dto: Partial<CreateWarehouseDocumentTypeDto | UpdateWarehouseDocumentTypeDto>, isCreate = false) {
    if (isCreate || dto.WarehouseDocumentTypeTitle !== undefined) {
      if (!dto.WarehouseDocumentTypeTitle || !dto.WarehouseDocumentTypeTitle.trim()) {
        throw new BadRequestException('عنوان نوع سند انبار اجباری است');
      }
    }

    if (isCreate || dto.WarehouseName !== undefined) {
      if (!dto.WarehouseName || !dto.WarehouseName.trim()) {
        throw new BadRequestException('نام انبار اجباری است');
      }
    }

    if (isCreate || dto.DisplayableItemNatures !== undefined) {
      if (!dto.DisplayableItemNatures || !Array.isArray(dto.DisplayableItemNatures) || dto.DisplayableItemNatures.length === 0) {
        throw new BadRequestException('ماهیت کالاهای قابل نمایش اجباری است');
      }
    }
  }

  private async validateDuplicates(dto: Partial<CreateWarehouseDocumentTypeDto | UpdateWarehouseDocumentTypeDto>, excludeId?: number) {
    if (dto.WarehouseDocumentTypeCode !== undefined) {
      const isDuplicateCode = await this.checkDuplicate('WarehouseDocumentTypeCode', dto.WarehouseDocumentTypeCode, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد نوع سند انبار تکراری است');
      }
    }

    if (dto.WarehouseDocumentTypeTitle !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('WarehouseDocumentTypeTitle', dto.WarehouseDocumentTypeTitle, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان نوع سند انبار تکراری است');
      }
    }
  }

  async create(createDto: CreateWarehouseDocumentTypeDto): Promise<WarehouseDocumentType> {
    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    await this.validateFields(createDto, true);

    let codeToSave = createDto.WarehouseDocumentTypeCode;

    if (!codeToSave) {
      const docRes = await this.repository.calculateNextCode(bsId, companyId);
      codeToSave = parseInt(docRes.nextValue, 10);
    }

    createDto.WarehouseDocumentTypeCode = codeToSave;
    await this.validateDuplicates(createDto);

    const id = await this.idGenerationService.generateNextId('WarehouseDocumentTypes');

    const entity: Partial<WarehouseDocumentType> = {
      ...createDto,
      WarehouseDocumentTypeID: id,
      WarehouseDocumentTypeCode: codeToSave,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId,
    };

    return this.repository.create(entity);
  }

  async update(id: number, updateDto: UpdateWarehouseDocumentTypeDto): Promise<WarehouseDocumentType> {
    await this.findOne(id);

    await this.validateFields(updateDto, false);
    await this.validateDuplicates(updateDto, id);

    const entityToSave: Partial<WarehouseDocumentType> = {
      ...updateDto,
      lastModifier: this.requestContextService.getUserId() || 1,
    };

    return this.repository.update(id, entityToSave);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
