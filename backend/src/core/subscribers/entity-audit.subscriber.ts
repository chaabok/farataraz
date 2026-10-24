import { Injectable } from '@nestjs/common';
import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
  RemoveEvent,
  DataSource,
} from 'typeorm';
import { RequestContextService } from '../services/request-context.service';
import { ActivityLogService } from '../services/activity-log.service';
import { ActivityAction } from '../entities/activity-log.entity';

import { AppBaseEntity } from '../entities/app-base.entity';

@Injectable()
@EventSubscriber()
export class EntityAuditSubscriber implements EntitySubscriberInterface<AppBaseEntity> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly activityLogService: ActivityLogService
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return AppBaseEntity;
  }

  private static cache = new Map<string, any>();

  private async resolveRefs(entity: any, targetName?: string, manager?: any) {
    if (!entity || targetName === 'BusinessStructure') return;

    // Use whichever ref is populated as the active/operating context ID
    const operatingBsId = entity.companyRef || entity.businessStructureRef;
    if (!operatingBsId) return;

    const queryTarget = manager || this.dataSource;
    const cacheKeyBs = `bs_${operatingBsId}`;

    try {
      let structures = EntityAuditSubscriber.cache.get(cacheKeyBs);
      if (!structures) {
        structures = await queryTarget.query(
          `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
          [operatingBsId]
        );
        EntityAuditSubscriber.cache.set(cacheKeyBs, structures);
      }

      if (structures && structures.length > 0) {
        const bs = structures.find((r: any) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === operatingBsId) || structures[0];
        const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
        
        if (bsType === 2) { // 2 = Company (subsidiary of HQ)
          const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
          entity.companyRef = operatingBsId;

          let isBasicShared = true;
          const basicInfoEntities = [
            'Currency',
            'Bank',
            'BankBranch',
            'BankAccount',
            'BankAccountType',
            'Cash',
            'Cashier',
            'Party',
            'PartyRelated',
            'DetailedAccount',
            'DetailedType',
            'CostCenter',
            'VoucherType',
            'OtherDetails',
            'GeoLocation',
            'RecieptAndPaymentAccountingSetting'
          ];

          if (basicInfoEntities.includes(targetName as string)) {
            if (structures.some((r: any) => {
              const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : (r.isBasicInfoShared !== undefined ? r.isBasicInfoShared : r.is_basic_info_shared);
              return val === false || val === 0 || val === 'false' || val === null;
            })) {
              isBasicShared = false;
            }
          }

          if (basicInfoEntities.includes(targetName as string) && !isBasicShared) {
            entity.businessStructureRef = operatingBsId;
          } else {
            entity.businessStructureRef = parentRef || operatingBsId;
          }
        } else if (bsType === 1) { // 1 = Holding/Headquarters
          entity.companyRef = operatingBsId;
          entity.businessStructureRef = operatingBsId;
        }
      }
    } catch (e) {
      console.error('EntityAuditSubscriber: resolveRefs failed:', e);
    }
  }

  async beforeInsert(event: InsertEvent<AppBaseEntity>) {
    const store = RequestContextService.getStore();
    const userId = store?.get('userId');
    
    if (userId && event.entity) {
      if ('creator' in event.entity) {
        event.entity.creator = userId;
      }
      if ('lastModifier' in event.entity) {
        event.entity.lastModifier = userId;
      }
    }

    if (event.entity) {
      await this.resolveRefs(event.entity, event.metadata?.targetName, event.manager);
    }
  }

  private extractEntityId(entity: any, metadata: any): string | undefined {
    if (!entity) return undefined;
    if (metadata && metadata.primaryColumns && metadata.primaryColumns.length > 0) {
      const propName = metadata.primaryColumns[0].propertyName;
      if (entity[propName]) {
        return String(entity[propName]);
      }
    }
    if (entity.id) return String(entity.id);
    return undefined;
  }

  private sanitizeValues(values: any, seen = new WeakSet()): any {
    if (values === null || values === undefined) return values;
    if (typeof values !== 'object') return values;
    if (values instanceof Date) return values;
    if (seen.has(values)) return '[Circular]';
    
    seen.add(values);

    if (Array.isArray(values)) {
      return values.slice(0, 100).map(v => this.sanitizeValues(v, seen));
    }

    const sanitized: any = {};
    for (const key of Object.keys(values)) {
      if (key.startsWith('__')) continue;
      
      const val = values[key];
      // Skip undefined, functions or class-transformer symbols
      if (val === undefined || typeof val === 'function' || typeof val === 'symbol') continue;
      
      sanitized[key] = this.sanitizeValues(val, seen);
    }
    return sanitized;
  }

  private shouldIgnoreEvent(metadata: any): boolean {
    if (!metadata) return true;
    const name = typeof metadata.targetName === 'function' ? (metadata.targetName as any).name : (metadata.targetName as string);
    return name === 'ActivityLog' || name === 'IDGeneration';
  }

  afterInsert(event: InsertEvent<AppBaseEntity>) {
    // if (this.shouldIgnoreEvent(event.metadata)) return; // Prevent loop or noise

    // const targetName = typeof event.metadata.targetName === 'function' ? (event.metadata.targetName as any).name : (event.metadata.targetName as string);

    // this.activityLogService.logActionAsync({
    //   action: ActivityAction.CREATE,
    //   entityName: targetName,
    //   entityId: this.extractEntityId(event.entity, event.metadata),
    //   newValues: this.sanitizeValues(event.entity),
    // });
  }

  async beforeUpdate(event: UpdateEvent<AppBaseEntity>) {
    const store = RequestContextService.getStore();
    const userId = store?.get('userId');
    
    if (userId && event.entity && 'lastModifier' in event.entity) {
      event.entity.lastModifier = userId;
    }

    if (event.entity) {
      await this.resolveRefs(event.entity, event.metadata?.targetName, event.manager);
    }
  }

  afterUpdate(event: UpdateEvent<AppBaseEntity>) {
    // if (this.shouldIgnoreEvent(event.metadata)) return; // Prevent loop

    // // TypeORM update event provides updatedColumns and databaseEntity (old values)
    // const oldValues = event.databaseEntity;
    // const newValues = event.entity;
    
    // const targetName = typeof event.metadata.targetName === 'function' ? (event.metadata.targetName as any).name : (event.metadata.targetName as string);

    // // Ignore lastSeen updates
    // if (newValues && Object.keys(newValues).length === 1 && 'lastSeen' in newValues) return;
    // if (targetName === 'User' && newValues && Object.keys(newValues).every(k => k === 'lastSeen' || k === 'id')) return;

    // this.activityLogService.logActionAsync({
    //   action: ActivityAction.UPDATE,
    //   entityName: targetName,
    //   entityId: this.extractEntityId(event.databaseEntity || event.entity, event.metadata),
    //   oldValues: this.sanitizeValues(oldValues),
    //   newValues: this.sanitizeValues(newValues),
    // });
  }

  afterRemove(event: RemoveEvent<AppBaseEntity>) {
    if (this.shouldIgnoreEvent(event.metadata)) return; // Prevent loop
    
    const targetName = typeof event.metadata.targetName === 'function' ? (event.metadata.targetName as any).name : (event.metadata.targetName as string);

    this.activityLogService.logActionAsync({
      action: ActivityAction.DELETE,
      entityName: targetName,
      entityId: this.extractEntityId(event.databaseEntity || event.entity, event.metadata),
      oldValues: this.sanitizeValues(event.databaseEntity || event.entity),
    });
  }
}

