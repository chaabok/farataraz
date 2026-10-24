import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';
import { IEntityNumberingRepository } from '../../domain/repositories/entity-numbering.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class EntityNumberingRepository implements IEntityNumberingRepository {
  constructor(
    @InjectRepository(EntityNumbering)
    private readonly repo: Repository<EntityNumbering>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async create(data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering> {
    const nextId = await this.idGenerationService.generateNextId('EntityNumbering');
    const entity = this.repo.create({ 
      ...data, 
      entityNumberingId: nextId,
      businessStructureRef,
      companyRef,
    });
    return this.repo.save(entity);
  }

  async update(id: number, data: Partial<EntityNumbering>): Promise<EntityNumbering> {
    await this.repo.update({ entityNumberingId: id as any }, data);
    return this.repo.findOne({ where: { entityNumberingId: id as any } }) as any;
  }

  async findAll(): Promise<EntityNumbering[]> {
    return this.repo.find();
  }

  async findByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering | null> {
    const rawRef = entityRef.replace(/^entity\./, '');
    const altRefs = Array.from(new Set([entityRef, rawRef, `entity.${rawRef}`]));

    // 1. Try with businessStructureRef and companyRef
    for (const ref of altRefs) {
      const found = await this.repo.findOne({
        where: { entityRef: ref, businessStructureRef, companyRef } as any
      });
      if (found) return found;
    }

    // 2. Try with businessStructureRef only
    for (const ref of altRefs) {
      const found = await this.repo.findOne({
        where: { entityRef: ref, businessStructureRef } as any
      });
      if (found) return found;
    }

    // 3. Try with entityRef only
    for (const ref of altRefs) {
      const found = await this.repo.findOne({
        where: { entityRef: ref } as any
      });
      if (found) return found;
    }

    return null;
  }

  async upsert(entityRef: string, data: Partial<EntityNumbering>, businessStructureRef: number, companyRef: number | null): Promise<EntityNumbering> {
    const existing = await this.findByEntityRef(entityRef, businessStructureRef, companyRef);
    if (existing) {
      return this.update(existing.entityNumberingId, data);
    } else {
      return this.create({ ...data, entityRef }, businessStructureRef, companyRef);
    }
  }

  async deleteByEntityRef(entityRef: string, businessStructureRef: number, companyRef: number | null): Promise<void> {
    const query: any = { entityRef: entityRef as any };
    if (businessStructureRef) {
      query.businessStructureRef = businessStructureRef;
    }
    if (companyRef !== undefined) {
      query.companyRef = companyRef;
    }
    await this.repo.delete(query);
  }
}
