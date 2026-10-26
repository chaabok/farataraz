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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GnrEntityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const gnr_entity_entity_1 = require("../../domain/entities/gnr-entity.entity");
const entity_type_enum_1 = require("../../domain/entities/entity-type.enum");
let GnrEntityService = class GnrEntityService {
    constructor(gnrEntityRepository, dataSource) {
        this.gnrEntityRepository = gnrEntityRepository;
        this.dataSource = dataSource;
    }
    async seedEntities() {
        console.log('GnrEntityService: Seeding entities...');
        const entities = [
            { id: 100, name: 'عمومی', type: entity_type_enum_1.EntityType.MenuGroup, parent: null },
            { id: 110, name: 'تنظیمات پایه', type: entity_type_enum_1.EntityType.SubMenu, parent: 100 },
            { id: 111, name: 'ساختار سازمانی', type: entity_type_enum_1.EntityType.Form, parent: 110 },
            { id: 112, name: 'سال مالی', type: entity_type_enum_1.EntityType.Form, parent: 110 },
            { id: 113, name: 'ارز', type: entity_type_enum_1.EntityType.Form, parent: 110 },
            { id: 114, name: 'تنظیمات سیستم', type: entity_type_enum_1.EntityType.Form, parent: 110 },
            { id: 200, name: 'مالی', type: entity_type_enum_1.EntityType.MenuGroup, parent: null },
            { id: 210, name: 'تعاریف پایه مالی', type: entity_type_enum_1.EntityType.SubMenu, parent: 200 },
            { id: 211, name: 'انواع سند', type: entity_type_enum_1.EntityType.Form, parent: 210 },
            { id: 212, name: 'حساب های تفصیلی', type: entity_type_enum_1.EntityType.Form, parent: 210 },
        ];
        for (const item of entities) {
            const existing = await this.gnrEntityRepository.findOne({ where: { entityID: item.id } });
            if (!existing) {
                const newEntity = new gnr_entity_entity_1.GnrEntity();
                newEntity.entityID = item.id;
                newEntity.entityName = item.name;
                newEntity.entityType = item.type;
                newEntity.parentRef = item.parent;
                newEntity.creator = 1;
                newEntity.lastModifier = 1;
                newEntity.businessStructureRef = 2;
                newEntity.companyRef = 2;
                await this.gnrEntityRepository.save(newEntity);
                console.log(`GnrEntityService: Created entity ${item.name} (${item.id})`);
            }
            else if (existing.entityName !== item.name || existing.parentRef !== item.parent || existing.entityType !== item.type) {
                existing.entityName = item.name;
                existing.parentRef = item.parent;
                existing.entityType = item.type;
                await this.gnrEntityRepository.save(existing);
                console.log(`GnrEntityService: Updated entity ${item.name} (${item.id})`);
            }
        }
    }
};
exports.GnrEntityService = GnrEntityService;
exports.GnrEntityService = GnrEntityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gnr_entity_entity_1.GnrEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], GnrEntityService);
//# sourceMappingURL=gnr-entity.service.js.map