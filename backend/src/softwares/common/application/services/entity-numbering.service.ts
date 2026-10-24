import { Injectable, Inject } from '@nestjs/common';
import { IEntityNumberingRepository, IEntityNumberingRepositoryToken } from '../../domain/repositories/entity-numbering.repository.interface';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';
import { BaseSettingsService } from './base-settings.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class EntityNumberingService {
  constructor(
    @Inject(IEntityNumberingRepositoryToken)
    private readonly repo: IEntityNumberingRepository,
    private readonly baseSettingsService: BaseSettingsService,
    private readonly requestContextService: RequestContextService,
  ) {}

  /**
   * Helper to resolve the correct tenant context based on the basic information sharing rule
   */
  async resolveTenantContext(): Promise<{ businessStructureRef: number; companyRef: number | null }> {
    const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
    const companyId = this.requestContextService.getCompanyId() || 2;

    let resolvedBSRef = businessStructureId;
    // Form numbering is exempt from basic info sharing rule (Rule 1).
    // Every company or business structure has its own specific numbering settings regardless of sharing status.
    const isShared = false;

    // Check BusinessStructure info to resolve standard parent/holding relation
    try {
      const db = (this.repo as any).repo.manager;
      const structures = await db.query(
        `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1`,
        [businessStructureId]
      );
      if (structures && structures.length > 0) {
        const bs = structures[0];
        const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
        const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
        if (bsType === 2 && parentRef > 0) {
          resolvedBSRef = parentRef;
        }
      }
    } catch (e) {
      console.error('entity-numbering.service: resolve business structure failed:', e);
    }

    if (isShared) {
      // Shared -> Belongs to Headquarters, visible/shared
      return {
        businessStructureRef: resolvedBSRef,
        companyRef: resolvedBSRef,
      };
    } else {
      // Private -> Belongs to specific company
      return {
        businessStructureRef: resolvedBSRef,
        companyRef: companyId,
      };
    }
  }

  async findByEntityRef(entityRef: string): Promise<EntityNumbering | null> {
    const { businessStructureRef, companyRef } = await this.resolveTenantContext();
    return this.repo.findByEntityRef(entityRef, businessStructureRef, companyRef);
  }

  async save(entityRef: string, data: Partial<EntityNumbering>): Promise<EntityNumbering> {
    const { businessStructureRef, companyRef } = await this.resolveTenantContext();
    return this.repo.upsert(entityRef, data, businessStructureRef, companyRef);
  }

  async findAll(): Promise<EntityNumbering[]> {
    return this.repo.findAll();
  }

  async remove(entityRef: string): Promise<void> {
    const { businessStructureRef, companyRef } = await this.resolveTenantContext();
    await this.repo.deleteByEntityRef(entityRef, businessStructureRef, companyRef);
  }
}
