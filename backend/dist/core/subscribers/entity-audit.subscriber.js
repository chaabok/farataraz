"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EntityAuditSubscriber_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityAuditSubscriber = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const request_context_service_1 = require("../services/request-context.service");
const activity_log_service_1 = require("../services/activity-log.service");
const activity_log_entity_1 = require("../entities/activity-log.entity");
const app_base_entity_1 = require("../entities/app-base.entity");
let EntityAuditSubscriber = EntityAuditSubscriber_1 = class EntityAuditSubscriber {
    constructor(dataSource, activityLogService) {
        this.dataSource = dataSource;
        this.activityLogService = activityLogService;
        dataSource.subscribers.push(this);
    }
    listenTo() {
        return app_base_entity_1.AppBaseEntity;
    }
    async resolveRefs(entity, targetName, manager) {
        if (!entity || targetName === 'BusinessStructure')
            return;
        const operatingBsId = entity.companyRef || entity.businessStructureRef;
        if (!operatingBsId)
            return;
        const queryTarget = manager || this.dataSource;
        const cacheKeyBs = `bs_${operatingBsId}`;
        try {
            let structures = EntityAuditSubscriber_1.cache.get(cacheKeyBs);
            if (!structures) {
                structures = await queryTarget.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [operatingBsId]);
                EntityAuditSubscriber_1.cache.set(cacheKeyBs, structures);
            }
            if (structures && structures.length > 0) {
                const bs = structures.find((r) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === operatingBsId) || structures[0];
                const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
                if (bsType === 2) {
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
                    if (basicInfoEntities.includes(targetName)) {
                        if (structures.some((r) => {
                            const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : (r.isBasicInfoShared !== undefined ? r.isBasicInfoShared : r.is_basic_info_shared);
                            return val === false || val === 0 || val === 'false' || val === null;
                        })) {
                            isBasicShared = false;
                        }
                    }
                    if (basicInfoEntities.includes(targetName) && !isBasicShared) {
                        entity.businessStructureRef = operatingBsId;
                    }
                    else {
                        entity.businessStructureRef = parentRef || operatingBsId;
                    }
                }
                else if (bsType === 1) {
                    entity.companyRef = operatingBsId;
                    entity.businessStructureRef = operatingBsId;
                }
            }
        }
        catch (e) {
            console.error('EntityAuditSubscriber: resolveRefs failed:', e);
        }
    }
    async beforeInsert(event) {
        const store = request_context_service_1.RequestContextService.getStore();
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
    extractEntityId(entity, metadata) {
        if (!entity)
            return undefined;
        if (metadata && metadata.primaryColumns && metadata.primaryColumns.length > 0) {
            const propName = metadata.primaryColumns[0].propertyName;
            if (entity[propName]) {
                return String(entity[propName]);
            }
        }
        if (entity.id)
            return String(entity.id);
        return undefined;
    }
    sanitizeValues(values, seen = new WeakSet()) {
        if (values === null || values === undefined)
            return values;
        if (typeof values !== 'object')
            return values;
        if (values instanceof Date)
            return values;
        if (seen.has(values))
            return '[Circular]';
        seen.add(values);
        if (Array.isArray(values)) {
            return values.slice(0, 100).map(v => this.sanitizeValues(v, seen));
        }
        const sanitized = {};
        for (const key of Object.keys(values)) {
            if (key.startsWith('__'))
                continue;
            const val = values[key];
            if (val === undefined || typeof val === 'function' || typeof val === 'symbol')
                continue;
            sanitized[key] = this.sanitizeValues(val, seen);
        }
        return sanitized;
    }
    shouldIgnoreEvent(metadata) {
        if (!metadata)
            return true;
        const name = typeof metadata.targetName === 'function' ? metadata.targetName.name : metadata.targetName;
        return name === 'ActivityLog' || name === 'IDGeneration';
    }
    afterInsert(event) {
    }
    async beforeUpdate(event) {
        const store = request_context_service_1.RequestContextService.getStore();
        const userId = store?.get('userId');
        if (userId && event.entity && 'lastModifier' in event.entity) {
            event.entity.lastModifier = userId;
        }
        if (event.entity) {
            await this.resolveRefs(event.entity, event.metadata?.targetName, event.manager);
        }
    }
    afterUpdate(event) {
    }
    afterRemove(event) {
        if (this.shouldIgnoreEvent(event.metadata))
            return;
        const targetName = typeof event.metadata.targetName === 'function' ? event.metadata.targetName.name : event.metadata.targetName;
        this.activityLogService.logActionAsync({
            action: activity_log_entity_1.ActivityAction.DELETE,
            entityName: targetName,
            entityId: this.extractEntityId(event.databaseEntity || event.entity, event.metadata),
            oldValues: this.sanitizeValues(event.databaseEntity || event.entity),
        });
    }
};
exports.EntityAuditSubscriber = EntityAuditSubscriber;
EntityAuditSubscriber.cache = new Map();
exports.EntityAuditSubscriber = EntityAuditSubscriber = EntityAuditSubscriber_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, typeorm_1.EventSubscriber)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        activity_log_service_1.ActivityLogService])
], EntityAuditSubscriber);
//# sourceMappingURL=entity-audit.subscriber.js.map