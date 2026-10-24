import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chequebook } from '../../domain/entities/chequebook.entity';
import { IChequebookRepository } from '../../domain/repositories/chequebook.repository.interface';
import { applyDataGridParams } from '../../../../core/utils/typeorm-query-builder';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { ChequebookItem } from '../../domain/entities/chequebook-item.entity';

@Injectable()
export class ChequebookRepository implements IChequebookRepository {
  constructor(
    @InjectRepository(Chequebook)
    private readonly repository: Repository<Chequebook>,
    private readonly idGenerationService: IdGenerationService,
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

  async create(chequebook: Partial<Chequebook>): Promise<Chequebook> {
    const { bsId, compId, isShared } = await this.getScope();

    // Check for uniqueness (Rule 1)
    if (chequebook.series) {
      const qb = this.repository.createQueryBuilder('chequebook')
         .where('chequebook.series = :series', { series: chequebook.series });
      if (isShared) {
        qb.andWhere('chequebook.businessStructureRef = :bsId', { bsId });
      } else {
        qb.andWhere('chequebook.companyRef = :compId', { compId });
      }
      const existing = await qb.getOne();
      if (existing) {
         throw new Error("Chequebook with this series already exists in the current scope.");
      }
    }

    const nextChequebookId = await this.idGenerationService.generateNextId('Chequebooks');
    chequebook.chequebookId = nextChequebookId;
    
    if (chequebook.items && Array.isArray(chequebook.items)) {
      const newItems = chequebook.items.filter(item => !item.chequebookItemId || (item as any).id?.toString().startsWith('temp'));
      if (newItems.length > 0) {
        const startId = await this.idGenerationService.generateNextIdBlock('ChequebookItems', newItems.length);
        let currentId = startId;
        for (const item of chequebook.items) {
          if (!item.chequebookItemId || (item as any).id?.toString().startsWith('temp')) {
            item.chequebookItemId = currentId++;
            item.chequebookRef = chequebook.chequebookId;
          }
          delete (item as any).id;
        }
      } else {
         for (const item of chequebook.items) {
             delete (item as any).id;
         }
      }
    }

    const userId = this.requestContextService.getUserId() || 1;
    chequebook.businessStructureRef = bsId;
    chequebook.companyRef = compId;
    chequebook.creator = userId;
    chequebook.lastModifier = userId;

    const newRecord = this.repository.create(chequebook);
    return await this.repository.save(newRecord);
  }

  async update(id: number, chequebook: Partial<Chequebook>): Promise<Chequebook> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new Error("Record not found");
    }

    if (chequebook.items && Array.isArray(chequebook.items)) {
      const newItems = chequebook.items.filter(item => !item.chequebookItemId || (item as any).id?.toString().startsWith('temp'));
      if (newItems.length > 0) {
        const startId = await this.idGenerationService.generateNextIdBlock('ChequebookItems', newItems.length);
        let currentId = startId;
        for (const item of chequebook.items) {
          if (!item.chequebookItemId || (item as any).id?.toString().startsWith('temp')) {
            item.chequebookItemId = currentId++;
            item.chequebookRef = existing.chequebookId;
          }
          delete (item as any).id;
        }
      } else {
         for (const item of chequebook.items) {
             delete (item as any).id;
         }
      }
    }
    
    const userId = this.requestContextService.getUserId() || 1;
    chequebook.lastModifier = userId;

    const updated = this.repository.merge(existing, chequebook);
    return await this.repository.save(updated);
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ chequebookId: id });
  }

  async findById(id: number): Promise<Chequebook | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('chequebook')
      .leftJoinAndSelect('chequebook.bankAccount', 'bankAccount')
      .leftJoinAndSelect('chequebook.items', 'items')
      .where('chequebook.chequebookId = :id', { id });
      
    if (isShared) {
      qb.andWhere('chequebook.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('chequebook.companyRef = :compId', { compId });
    }
    return await qb.getOne();
  }

  async findAll(options?: any): Promise<{items: Chequebook[], total: number}> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('chequebook')
      .leftJoinAndSelect('chequebook.bankAccount', 'bankAccount')
      .leftJoinAndSelect('chequebook.items', 'items');
      
    if (isShared) {
      qb.where('chequebook.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('chequebook.companyRef = :compId', { compId });
    }
    
    if (options) {
      applyDataGridParams(qb, options, 'chequebook');
    }
    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }
}