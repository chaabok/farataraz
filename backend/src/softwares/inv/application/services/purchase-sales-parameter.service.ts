import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IPurchaseSalesParameterRepository, IPurchaseSalesParameterRepositoryToken } from '../../domain/repositories/purchase-sales-parameter.repository.interface';
import { PurchaseSalesParameter } from '../../domain/entities/purchase-sales-parameter.entity';
import { PurchaseSalesParameterValue } from '../../domain/entities/purchase-sales-parameter-value.entity';
import { CreatePurchaseSalesParameterDto } from '../dtos/create-purchase-sales-parameter.dto';
import { UpdatePurchaseSalesParameterDto } from '../dtos/update-purchase-sales-parameter.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class PurchaseSalesParameterService {
  constructor(
    @Inject(IPurchaseSalesParameterRepositoryToken)
    private readonly repository: IPurchaseSalesParameterRepository,
    @InjectRepository(PurchaseSalesParameterValue)
    private readonly valueRepository: Repository<PurchaseSalesParameterValue>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async findAll(query?: any): Promise<any> {
    const data = await this.repository.findAll();
    const allValues = await this.valueRepository.find({
      order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
    });
    const valuesMap = new Map<number, PurchaseSalesParameterValue[]>();
    for (const val of allValues) {
      const ref = Number(val.PurchaseSalesParameterRef);
      if (!valuesMap.has(ref)) {
        valuesMap.set(ref, []);
      }
      valuesMap.get(ref)!.push(val);
    }
    const result = data.map((item: any) => ({
      ...item,
      ParameterValues: valuesMap.get(Number(item.PurchaseSalesParameterID)) || [],
    }));
    return { data: result, total: result.length, success: true };
  }

  async findOne(id: number): Promise<any> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('پارامتر خرید و فروش یافت نشد');
    
    const parameterValues = await this.valueRepository.find({
      where: { PurchaseSalesParameterRef: id },
      order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
    });

    return {
      ...entity,
      ParameterValues: parameterValues || [],
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.repository.checkDuplicate(field, value, excludeId);
  }

  private async validateFields(dto: Partial<CreatePurchaseSalesParameterDto | UpdatePurchaseSalesParameterDto>, isCreate = false) {
    if (isCreate || dto.Title !== undefined) {
      if (!dto.Title || !dto.Title.trim()) {
        throw new BadRequestException('عنوان اجباری است');
      }
    }

    if (isCreate || dto.PrintPriority !== undefined) {
      if (dto.PrintPriority === null || dto.PrintPriority === undefined || (dto.PrintPriority as any) === '') {
        throw new BadRequestException('اولویت چاپ اجباری است');
      }
    }

    if (isCreate || dto.CalculationPriority !== undefined) {
      if (dto.CalculationPriority === null || dto.CalculationPriority === undefined || (dto.CalculationPriority as any) === '') {
        throw new BadRequestException('اولویت محاسبه اجباری است');
      }
    }

    if (dto.HasAccountingVoucher) {
      if (!dto.SlAccountRef) {
        throw new BadRequestException('در صورت انتخاب "دارای سند حسابداری"، انتخاب حساب معین اجباری است');
      }
    }
  }

  private async validateDuplicates(dto: Partial<CreatePurchaseSalesParameterDto | UpdatePurchaseSalesParameterDto>, excludeId?: number) {
    if (dto.Title !== undefined && dto.Title.trim()) {
      const isDuplicateTitle = await this.checkDuplicate('Title', dto.Title.trim(), excludeId);
      if (isDuplicateTitle) {
        throw new BadRequestException('عنوان پارامتر خرید و فروش تکراری است');
      }
    }

    if (dto.PrintPriority !== undefined && dto.PrintPriority !== null) {
      const isDuplicatePrintPriority = await this.checkDuplicate('PrintPriority', dto.PrintPriority, excludeId);
      if (isDuplicatePrintPriority) {
        throw new BadRequestException('اولویت چاپ تکراری است');
      }
    }
  }

  private formatChar10Date(d?: string): string | null {
    if (!d) return null;
    const trimmed = String(d).trim();
    if (!trimmed) return null;
    if (trimmed.includes('T')) {
      return trimmed.split('T')[0].replace(/-/g, '/').slice(0, 10);
    }
    return trimmed.slice(0, 10);
  }

  private async saveParameterValues(parameterId: number, values?: any[]) {
    if (!values) return [];
    
    const validRows = values.filter((v) => v && (v.StartDate || v.EndDate || v.ParameterValue !== undefined || v.Description || v.ProductServiceRef || v.ProductServiceCode));
    if (validRows.length === 0) return [];

    const userId = this.requestContextService.getUserId() || 1;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const nowTime = new Date().toTimeString().split(' ')[0];

    const startId = await this.idGenerationService.generateNextIdBlock('PurchaseSalesParameterValue', validRows.length);

    const entities = validRows.map((v, idx) => {
      const valNum = v.ParameterValue !== undefined && v.ParameterValue !== null && v.ParameterValue !== '' ? Number(v.ParameterValue) : 0;
      return this.valueRepository.create({
        PurchaseSalesParameterValueID: startId + idx,
        PurchaseSalesParameterRef: parameterId,
        RowNo: v.RowNo ? Number(v.RowNo) : idx + 1,
        StartDate: this.formatChar10Date(v.StartDate),
        EndDate: this.formatChar10Date(v.EndDate),
        ProductServiceRef: v.ProductServiceRef ? Number(v.ProductServiceRef) : null,
        ProductServiceCode: v.ProductServiceCode || null,
        ProductServiceName: v.ProductServiceName || null,
        MeasurementUnitName: v.MeasurementUnitName || null,
        ParameterValue: isNaN(valNum) ? 0 : valNum,
        Description: v.Description || null,
        companyRef: companyId,
        businessStructureRef: bsId,
        creator: userId,
        lastModifier: userId,
        createTime: nowTime,
        lastModificationTime: nowTime,
      });
    });

    return this.valueRepository.save(entities);
  }

  async create(createDto: CreatePurchaseSalesParameterDto): Promise<any> {
    const userId = this.requestContextService.getUserId();
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;

    await this.validateFields(createDto, true);
    await this.validateDuplicates(createDto);

    const id = await this.idGenerationService.generateNextIdBlock('PurchaseSalesParameters', 1);

    const { ParameterValues, ...masterDto } = createDto;

    const entity: Partial<PurchaseSalesParameter> = {
      ...masterDto,
      PurchaseSalesParameterID: id,
      creator: userId || 1,
      companyRef: createDto.companyRef || companyId,
      businessStructureRef: createDto.businessStructureRef || bsId,
    };

    const savedMaster = await this.repository.create(entity);
    const savedValues = await this.saveParameterValues(id, ParameterValues);

    return {
      ...savedMaster,
      ParameterValues: savedValues,
    };
  }

  async update(id: number, updateDto: UpdatePurchaseSalesParameterDto): Promise<any> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('پارامتر خرید و فروش یافت نشد');

    const mergedDto = { ...existing, ...updateDto };
    await this.validateFields(mergedDto, false);
    await this.validateDuplicates(updateDto, id);

    const { ParameterValues, ...masterDto } = updateDto;

    const entityToSave: Partial<PurchaseSalesParameter> = {
      ...masterDto,
      lastModifier: this.requestContextService.getUserId() || 1,
    };

    const updatedMaster = await this.repository.update(id, entityToSave);

    if (ParameterValues !== undefined) {
      await this.valueRepository.delete({ PurchaseSalesParameterRef: id });
      const savedValues = await this.saveParameterValues(id, ParameterValues);
      return {
        ...updatedMaster,
        ParameterValues: savedValues,
      };
    } else {
      const currentValues = await this.valueRepository.find({
        where: { PurchaseSalesParameterRef: id },
        order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
      });
      return {
        ...updatedMaster,
        ParameterValues: currentValues,
      };
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('پارامتر خرید و فروش یافت نشد');

    await this.valueRepository.delete({ PurchaseSalesParameterRef: id });
    await this.repository.delete(id);
  }
}
