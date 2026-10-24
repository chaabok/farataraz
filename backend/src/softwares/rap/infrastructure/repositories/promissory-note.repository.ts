import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromissoryNote } from '../../domain/entities/promissory-note.entity';
import { PromissoryNoteItem } from '../../domain/entities/promissory-note-item.entity';
import { IPromissoryNoteRepository } from '../../domain/repositories/promissory-note.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class PromissoryNoteRepository implements IPromissoryNoteRepository {
  constructor(
    @InjectRepository(PromissoryNote)
    private readonly repository: Repository<PromissoryNote>,
    @InjectRepository(PromissoryNoteItem)
    private readonly itemRepository: Repository<PromissoryNoteItem>,
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

  async findAll(): Promise<PromissoryNote[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('note')
      .leftJoinAndSelect('note.cash', 'cash');
      
    if (isShared) {
      qb.where('note.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('note.companyRef = :compId', { compId });
    }
    return qb.getMany();
  }

  async findWithPagination(params: any): Promise<{ data: PromissoryNote[], total: number }> {
    const { pageIndex = 0, pageSize = 10, sorting, columnFilters, globalFilter, advancedFilters } = params;

    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('note')
      .leftJoinAndSelect('note.cash', 'cash');

    if (isShared) {
      qb.where('note.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('note.companyRef = :compId', { compId });
    }

    // Parse filters
    if (columnFilters) {
      try {
        const filters = typeof columnFilters === 'string' ? JSON.parse(columnFilters) : columnFilters;
        filters.forEach((filter: any, index: number) => {
          if (filter.id && filter.value) {
            let filterField = `note.${filter.id}`;
            if (filter.id.includes('.')) {
              const parts = filter.id.split('.');
              filterField = `${parts[0]}.${parts[1]}`;
            }
            qb.andWhere(`${filterField} LIKE :filterValue${index}`, { 
              [`filterValue${index}`]: `%${filter.value}%` 
            });
          }
        });
      } catch (e) {
        console.error('Error parsing columnFilters:', e);
      }
    }

    if (globalFilter) {
      qb.andWhere('(note.series LIKE :global OR cash.title LIKE :global OR CAST(note.promissoryNoteId AS varchar) LIKE :global)', {
        global: `%${globalFilter}%`
      });
    }

    // Parse sorting
    if (sorting) {
      try {
        const _sorting = typeof sorting === 'string' ? JSON.parse(sorting) : sorting;
        if (_sorting && _sorting.length > 0) {
          _sorting.forEach((s: any) => {
            let sortField = `note.${s.id}`;
            if (s.id.includes('.')) {
              const parts = s.id.split('.');
              sortField = `${parts[0]}.${parts[1]}`;
            }
            qb.addOrderBy(sortField, s.desc ? 'DESC' : 'ASC');
          });
        } else {
          qb.orderBy('note.promissoryNoteId', 'DESC');
        }
      } catch (e) {
        console.error('Error parsing sorting:', e);
        qb.orderBy('note.promissoryNoteId', 'DESC');
      }
    } else {
      qb.orderBy('note.promissoryNoteId', 'DESC');
    }

    const [data, total] = await qb
      .skip(pageIndex * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { data, total };
  }

  async findById(id: number): Promise<PromissoryNote | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('note')
      .leftJoinAndSelect('note.items', 'items')
      .leftJoinAndSelect('note.cash', 'cash')
      .where('note.promissoryNoteId = :id', { id });
      
    if (isShared) {
      qb.andWhere('note.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('note.companyRef = :compId', { compId });
    }
    
    return qb.getOne();
  }

  async findUnusedItems(): Promise<PromissoryNoteItem[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.itemRepository.createQueryBuilder('item')
      .leftJoinAndSelect('item.promissoryNote', 'note')
      .where('item.status = 1');
      
    if (isShared) {
      qb.andWhere('note.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('note.companyRef = :compId', { compId });
    }
    
    return qb.getMany();
  }

  async create(data: Partial<PromissoryNote>): Promise<PromissoryNote> {
    const { bsId, compId, isShared } = await this.getScope();
    
    const id = await this.idGenerationService.generateNextId('PromissoryNote');

    // Default values if not provided
    const payload = {
        ...data,
        promissoryNoteId: id,
        businessStructureRef: bsId,
        companyRef: compId,
        cashRef: data.cashRef || (data as any)['cashRef'] || (data as any)['CashRef'] || (data as any)['cash']?.['cashId']
    };
    
    // Check for uniqueness (Rule 1)
    if (payload.series) {
      const qb = this.repository.createQueryBuilder('note')
         .where('note.series = :series', { series: payload.series });
      if (isShared) {
        qb.andWhere('note.businessStructureRef = :bsId', { bsId });
      } else {
        qb.andWhere('note.companyRef = :compId', { compId });
      }
      const existing = await qb.getOne();
      if (existing) {
         throw new Error("PromissoryNote with this series already exists in the current scope.");
      }
    }
    
    // Generate IDs for items if they exist
    if (payload.items && Array.isArray(payload.items)) {
      const newItems = payload.items.filter(item => !item.promissoryNoteItemId || (item as any).id?.toString().startsWith('temp'));
      if (newItems.length > 0) {
        const startId = await this.idGenerationService.generateNextIdBlock('PromissoryNoteItem', newItems.length);
        let currentId = startId;
        for (const item of payload.items) {
          if (!item.promissoryNoteItemId || (item as any).id?.toString().startsWith('temp')) {
            item.promissoryNoteItemId = currentId++;
            item.promissoryNoteRef = id;
          }
          delete (item as any).id;
        }
      } else {
         for (const item of payload.items) {
             delete (item as any).id;
         }
      }
    }
    
    const note = this.repository.create(payload);
    return this.repository.save(note);
  }

  async update(id: number, data: Partial<PromissoryNote>): Promise<PromissoryNote> {
    const existing = await this.findById(id);
    if (!existing) throw new Error('Not found');

    // Merge basic props
    const payload = {
        ...existing,
        ...data,
        cashRef: data.cashRef || (data as any)['cashRef'] || existing.cashRef,
        promissoryNoteId: id
    };
    
    // Generate IDs for new items if they exist
    if (payload.items && Array.isArray(payload.items)) {
      const newItems = payload.items.filter(item => !item.promissoryNoteItemId || (item as any).id?.toString().startsWith('temp'));
      if (newItems.length > 0) {
        const startId = await this.idGenerationService.generateNextIdBlock('PromissoryNoteItem', newItems.length);
        let currentId = startId;
        for (const item of payload.items) {
          if (!item.promissoryNoteItemId || (item as any).id?.toString().startsWith('temp')) {
            item.promissoryNoteItemId = currentId++;
            item.promissoryNoteRef = id;
          }
          delete (item as any).id;
        }
      } else {
         for (const item of payload.items) {
             delete (item as any).id;
         }
      }
    }

    return this.repository.save(payload);
  }

  async delete(id: number): Promise<void> {
    console.log(`Starting DELETE for PromissoryNote ID: ${id}`);
    try {
      await this.itemRepository.delete({ promissoryNoteRef: id });
      console.log(`Successfully deleted items for PromissoryNote ID: ${id}`);

      await this.repository.delete({ promissoryNoteId: id });
      console.log(`Successfully deleted PromissoryNote ID: ${id}`);
    } catch (error) {
      console.error(`Error deleting PromissoryNote ID: ${id}`, error);
      throw error;
    }
  }
}
