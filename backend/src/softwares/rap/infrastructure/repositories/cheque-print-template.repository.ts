import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChequePrintTemplate } from '../../domain/entities/cheque-print-template.entity';
import { IChequePrintTemplateRepository } from '../../domain/repositories/cheque-print-template.repository.interface';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ChequePrintTemplateRepository implements IChequePrintTemplateRepository {
  constructor(
    @InjectRepository(ChequePrintTemplate)
    private readonly repository: Repository<ChequePrintTemplate>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    const compId = this.requestContextService.getCompanyId() ?? 2;
    
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
    } catch(e) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async create(data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate> {
    const { bsId, compId, isShared } = await this.getScope();

    // Check for uniqueness (Rule 1)
    if (data.title) {
      const qb = this.repository.createQueryBuilder('template')
         .where('template.title = :title', { title: data.title });
      if (isShared) {
        qb.andWhere('template.businessStructureRef = :bsId', { bsId });
      } else {
        qb.andWhere('template.companyRef = :compId', { compId });
      }
      const existing = await qb.getOne();
      if (existing) {
         throw new Error("ChequePrintTemplate with this title already exists in the current scope.");
      }
    }

    if (!data.chequePrintTemplateId) {
      data.chequePrintTemplateId = await this.idGenService.generateNextId('ChequePrintTemplate');
    }
    
    const entity = this.repository.create({
      ...data,
      businessStructureRef: bsId,
      companyRef: compId,
    });
    return await this.repository.save(entity);
  }

  async update(id: number, data: Partial<ChequePrintTemplate>): Promise<ChequePrintTemplate> {
    await this.repository.update({ chequePrintTemplateId: id }, data);
    return await this.findById(id) as ChequePrintTemplate;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ chequePrintTemplateId: id });
  }

  async findById(id: number): Promise<ChequePrintTemplate | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('template')
      .where('template.chequePrintTemplateId = :id', { id });
      
    if (isShared) {
      qb.andWhere('template.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('template.companyRef = :compId', { compId });
    }
    return await qb.getOne();
  }

  async findAll(): Promise<ChequePrintTemplate[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('template');
    
    if (isShared) {
      qb.where('template.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('template.companyRef = :compId', { compId });
    }
    
    return await qb.getMany();
  }

  async findAdvanced(params: any): Promise<[ChequePrintTemplate[], number]> {
    const qb = this.repository.createQueryBuilder('template');
    const { bsId, compId, isShared } = await this.getScope();
    
    if (isShared) {
      qb.where('template.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('template.companyRef = :compId', { compId });
    }
    
    Object.assign(params, { globalSearchFields: ['template.title'] });
    applyDataGridParams(qb, params, 'template');
    return qb.getManyAndCount();
  }
}
