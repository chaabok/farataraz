import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GnrEntity } from '../../domain/entities/gnr-entity.entity';
import { EntityType } from '../../domain/entities/entity-type.enum';

@Injectable()
export class GnrEntityService {
  constructor(
    @InjectRepository(GnrEntity)
    private readonly gnrEntityRepository: Repository<GnrEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async seedEntities() {
    console.log('GnrEntityService: Seeding entities...');
    
    const entities = [
      // MenuGroup: General (ID: 100)
      { id: 100, name: 'عمومی', type: EntityType.MenuGroup, parent: null },
      
      // SubMenus under General
      { id: 110, name: 'تنظیمات پایه', type: EntityType.SubMenu, parent: 100 },
      
      // Forms under General/Settings
      { id: 111, name: 'ساختار سازمانی', type: EntityType.Form, parent: 110 },
      { id: 112, name: 'سال مالی', type: EntityType.Form, parent: 110 },
      { id: 113, name: 'ارز', type: EntityType.Form, parent: 110 },
      { id: 114, name: 'تنظیمات سیستم', type: EntityType.Form, parent: 110 },

      // MenuGroup: Accounting (ID: 200)
      { id: 200, name: 'مالی', type: EntityType.MenuGroup, parent: null },
      
      // SubMenus under Accounting
      { id: 210, name: 'تعاریف پایه مالی', type: EntityType.SubMenu, parent: 200 },
      
      // Forms under Accounting/Basic Definitions
      { id: 211, name: 'انواع سند', type: EntityType.Form, parent: 210 },
      { id: 212, name: 'حساب های تفصیلی', type: EntityType.Form, parent: 210 },
    ];

    for (const item of entities) {
      const existing = await this.gnrEntityRepository.findOne({ where: { entityID: item.id } });
      if (!existing) {
        const newEntity = new GnrEntity();
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
      } else if (existing.entityName !== item.name || existing.parentRef !== item.parent || existing.entityType !== item.type) {
        existing.entityName = item.name;
        existing.parentRef = item.parent;
        existing.entityType = item.type;
        await this.gnrEntityRepository.save(existing);
        console.log(`GnrEntityService: Updated entity ${item.name} (${item.id})`);
      }
    }

    // Mechanism to auto-register new controllers if needed (optional implementation detail)
    // We can iterate over registered controllers in AppModule later
  }
}
