import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IMeasurementUnitRepository } from '../../domain/repositories/measurement-unit.repository.interface';
import { MeasurementUnit } from '../../domain/entities/measurement-unit.entity';
import { CreateMeasurementUnitDto } from '../dtos/create-measurement-unit.dto';
import { UpdateMeasurementUnitDto } from '../dtos/update-measurement-unit.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class MeasurementUnitService {
  constructor(
    @Inject(IMeasurementUnitRepository)
    private readonly repository: IMeasurementUnitRepository,
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
    const { skip, take, search, sortModel, filterModel } = query;
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

  async findOne(id: number): Promise<MeasurementUnit> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('MeasurementUnit not found');
    return entity;
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

  private async validateDuplicates(dto: Partial<CreateMeasurementUnitDto | UpdateMeasurementUnitDto>, excludeId?: number) {
    if (dto.MeasurementUnitCode !== undefined) {
      const isDuplicateCode = await this.checkDuplicate('MeasurementUnitCode', dto.MeasurementUnitCode, excludeId);
      if (isDuplicateCode) {
        throw new BadRequestException('کد واحد سنجش تکراری است');
      }
    }
    
    if (dto.MeasurementUnitName !== undefined) {
      const isDuplicateTitle = await this.checkDuplicate('MeasurementUnitName', dto.MeasurementUnitName, excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان واحد سنجش تکراری است');
      }
    }
    
    if (dto.MeasurementUnitName2 !== undefined && dto.MeasurementUnitName2 !== null && dto.MeasurementUnitName2 !== '') {
      const isDuplicateTitle2 = await this.checkDuplicate('MeasurementUnitName2', dto.MeasurementUnitName2, excludeId);
      if (isDuplicateTitle2) {
        throw new BadRequestException('عنوان دوم واحد سنجش تکراری است');
      }
    }
  }

  async create(createDto: CreateMeasurementUnitDto): Promise<MeasurementUnit> {
    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    let codeToSave = createDto.MeasurementUnitCode;
    
    const docRes = await this.repository.calculateNextCode(bsId, companyId);
    
    // Auto numbering
    if (docRes.numberingMethod === '2' || !codeToSave) {
      if (docRes.error) {
        throw new BadRequestException(docRes.error);
      }
      codeToSave = parseInt(docRes.nextValue, 10);
    } else {
       // Manual numbering check can be added if needed
    }

    createDto.MeasurementUnitCode = codeToSave;
    await this.validateDuplicates(createDto);

    const id = await this.idGenerationService.generateNextId('MeasurementUnits');

    // Setting defaults if not provided (though in a real app these typically come from context directly)
    const entity = {
      ...createDto,
      MeasurementUnitCode: codeToSave,
      MeasurementUnitID: id,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId
    };
    return this.repository.create(entity);
  }

  async update(id: number, updateDto: UpdateMeasurementUnitDto): Promise<MeasurementUnit> {
    const existing = await this.findOne(id);
    
    // Merge existing code to check duplicates correctly
    if (updateDto.MeasurementUnitCode === undefined) {
       (updateDto as any).MeasurementUnitCode = existing.MeasurementUnitCode;
    }
    
    await this.validateDuplicates(updateDto, id);
    
    const userId = this.requestContextService.getUserId();
    const entityToUpdate = {
      ...updateDto,
      lastModifier: userId || 1,
    };
    return this.repository.update(id, entityToUpdate);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.repository.delete(id);
  }
}
