import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { ICostCenterRepository, ICostCenterRepositoryToken } from '../../domain/repositories/cost-center.repository.interface';
import { CostCenter } from '../../domain/entities/cost-center.entity';
import { CreateCostCenterDto } from '../dtos/create-cost-center.dto';
import { UpdateCostCenterDto } from '../dtos/update-cost-center.dto';
import { DetailedAccountService } from './detailed-account.service';
import { DetailedTypeService } from './detailed-type.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class CostCenterService {
  constructor(
    @Inject(ICostCenterRepositoryToken)
    private readonly costCenterRepository: ICostCenterRepository,
    private readonly detailedAccountService: DetailedAccountService,
    private readonly detailedTypeService: DetailedTypeService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async create(createDto: CreateCostCenterDto): Promise<CostCenter> {
    let detailedAccountId: number | null = null;
    const detailedTypes = await this.detailedTypeService.findAll();
    const typeCostCenter = detailedTypes.find(t => t.code === '15');
    
    if (typeCostCenter) {
      const newDa = await this.detailedAccountService.create({
        code: createDto.detailedAccountCode,
        title: createDto.title,
        title_en: createDto.title_en,
        detailedTypesId: typeCostCenter.detailedTypesId,
        description: createDto.description,
        isActive: createDto.isActive ?? true,
      });
      detailedAccountId = newDa.detailedAccountId;
    } else {
      throw new Error("نوع تفصیل 'مراکز هزینه' (کد 15) یافت نشد.");
    }

    let bsId = this.requestContextService.getBusinessStructureId() || 2;
    let compId = this.requestContextService.getCompanyId() || 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;

    const data: Partial<CostCenter> = {
      code: createDto.code,
      title: createDto.title,
      title_en: createDto.title_en,
      costCenterType: createDto.costCenterType,
      isActive: createDto.isActive,
      description: createDto.description,
      detailedAccountId: detailedAccountId,
      businessStructureRef: bsId,
      companyRef: compId,
    };

    return this.costCenterRepository.create(data);
  }

  async update(id: number, updateDto: UpdateCostCenterDto): Promise<CostCenter> {
    const existing = await this.findOne(id);
    
    if (existing.detailedAccountId && existing.detailedAccount) {
      await this.detailedAccountService.update(existing.detailedAccountId, {
        code: updateDto.detailedAccountCode,
        title: updateDto.title,
        title_en: updateDto.title_en,
        detailedTypesId: existing.detailedAccount.detailedTypesId,
        description: updateDto.description,
        isActive: updateDto.isActive ?? true,
      });
    }

    const data: Partial<CostCenter> = {
      code: updateDto.code,
      title: updateDto.title,
      title_en: updateDto.title_en,
      costCenterType: updateDto.costCenterType,
      isActive: updateDto.isActive,
      description: updateDto.description,
    };

    return this.costCenterRepository.update(id, data);
  }

  async findAll(): Promise<CostCenter[]> {
    return this.costCenterRepository.findAll();
  }

  async findWithPagination(params: any): Promise<{ items: CostCenter[], total: number }> {
    const [items, total] = await this.costCenterRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<CostCenter> {
    const item = await this.costCenterRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`CostCenter with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    const detailedAccountId = existing.detailedAccountId;
    
    await this.costCenterRepository.delete(id);
    
    if (detailedAccountId) {
      try {
        await this.detailedAccountService.remove(detailedAccountId);
      } catch (e) {
        console.error('Failed to delete detailed account:', e);
      }
    }
  }

  async bulkRemove(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.remove(id);
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.costCenterRepository.checkDuplicate(field, value, excludeId);
  }
  
  async getNextCode(): Promise<number> {
    const maxCode = await this.costCenterRepository.getMaxCode(1);
    return maxCode + 1;
  }
}
