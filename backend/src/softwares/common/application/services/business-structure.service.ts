import { Injectable, Inject, BadRequestException, OnModuleInit } from '@nestjs/common';
import { BusinessStructureRepository } from '../../infrastructure/repositories/business-structure.repository';
import { CreateBusinessStructureDto } from '../dtos/create-business-structure.dto';
import { UpdateBusinessStructureDto } from '../dtos/update-business-structure.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BusinessStructureType } from '../../domain/entities/business-structure.enum';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { SeedInitializerService } from './seed-initializer.service';

@Injectable()
export class BusinessStructureService implements OnModuleInit {
  constructor(
    @Inject('IBusinessStructureRepository')
    private readonly repository: BusinessStructureRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly seedInitializerService: SeedInitializerService,
  ) {}

  async onModuleInit() {
    // Rule #2: Ensure no operational data is bound to system root ID 1
    try {
      await this.seedInitializerService.unseedAll(1);
    } catch (e) {
      // Ignore cleanup error if ID 1 has no records or foreign keys
    }

    const all = await this.repository.findAll();
    const hasRoot = all.some(x => x.code === '01');
    const hasChild = all.some(x => x.code === '01-01');

    if (process.env.SYNC_DB === 'true' || !hasRoot || !hasChild) {
      try {
        console.log('BusinessStructureService: Ensuring default business structures and associated seeds exist...');
        await this.seedDefaults();
      } catch (error) {
        console.error('BusinessStructureService: Error ensuring defaults:', error);
      }
    }
  }

  async seedDefaults() {
    console.log('BusinessStructureService: seedDefaults started');

    // Rule #2: Ensure no operational data is bound to system root ID 1
    try {
      await this.seedInitializerService.unseedAll(1);
    } catch (e) {
      // Ignore cleanup error if ID 1 has no records or foreign keys
    }

    const all = await this.repository.findAll();
    
    // Rule #2: ID 1 is reserved for system root structure only
    let systemRoot = all.find(x => x.businessStructureId === 1);
    if (!systemRoot) {
      console.log('BusinessStructureService: Creating system root (ID 1)...');
      // Manually ensure IDGeneration is aware or at least avoid collisions
      await this.idGenerationService.generateNextId('BusinessStructure'); // This will probably return 1
      systemRoot = await this.repository.create({
        businessStructureId: 1,
        parentRef: 0,
        code: 'ROOT',
        title: 'ساختار سیستم',
        title_en: 'System Root',
        businessStructure: BusinessStructureType.Holding,
        isSystem: true,
        isActive: true,
      });
    }

    let headquarter = all.find(x => x.code === '01');
    if (!headquarter) {
      console.log('BusinessStructureService: Creating main headquarters (01)...');
      const hqId = await this.idGenerationService.generateNextId('BusinessStructure');
      // Ensure we don't use 1 for data-bearing BS
      const finalHqId = hqId === 1 ? await this.idGenerationService.generateNextId('BusinessStructure') : hqId;
      
      headquarter = await this.repository.create({
        businessStructureId: finalHqId,
        parentRef: 1, // Parent is the system root (ID 1)
        code: '01',
        title: 'دفتر مرکزی',
        title_en: 'Headquarters',
        businessStructure: BusinessStructureType.Holding,
        businessStructureName: 'Headquarters',
        isSystem: true,
        isActive: true,
        isBasicInfoShared: true,
        activeStructureTypes: '1,2,3,4',
      });
      console.log(`BusinessStructureService: Headquarters created with ID: ${headquarter.businessStructureId}`);
      // Seed for headquarters
      await this.seedInitializerService.initializeSeeds(headquarter.businessStructureId);
    } else {
      console.log(`BusinessStructureService: Headquarters already exists (ID: ${headquarter.businessStructureId})`);
      if (headquarter.parentRef !== 1) {
        await this.repository.update(headquarter.businessStructureId, { parentRef: 1, isSystem: true });
      }
      await this.seedInitializerService.initializeSeeds(headquarter.businessStructureId);
    }

    let sampleCompany = all.find(x => x.code === '01-01');
    if (!sampleCompany) {
      console.log('BusinessStructureService: Creating sample company (01-01)...');
      const companyId = await this.idGenerationService.generateNextId('BusinessStructure');
      sampleCompany = await this.repository.create({
        businessStructureId: companyId,
        parentRef: headquarter.businessStructureId,
        code: '01-01',
        title: 'شرکت نمونه یک',
        title_en: 'Sample Company One',
        businessStructure: BusinessStructureType.Company,
        businessStructureName: 'Sample Company',
        isSystem: true,
        isActive: true,
        isBasicInfoShared: true,
      });
      console.log(`BusinessStructureService: Sample company created with ID: ${sampleCompany.businessStructureId}`);
      // Seed for sample company
      await this.seedInitializerService.initializeSeeds(sampleCompany.businessStructureId);
    } else {
      console.log(`BusinessStructureService: Sample company already exists (ID: ${sampleCompany.businessStructureId})`);
      await this.seedInitializerService.initializeSeeds(sampleCompany.businessStructureId);
    }
    console.log('BusinessStructureService: seedDefaults completed');
  }

  async create(dto: CreateBusinessStructureDto, companyId: number = 2): Promise<BusinessStructure> {
    const nextId = await this.idGenerationService.generateNextId('BusinessStructure');
    const created = await this.repository.create({ ...dto, businessStructureId: nextId, isSystem: false, companyRef: companyId } as any);
    
    // Seeding is handled step-by-step by the frontend DatabaseSeedModal if basic info is not shared,
    // or loaded from headquarters if basic info is shared (no action needed). 
    // This maintains immediate response times and prevents HTTP timeouts on the client side.
    
    return created;
  }

  async findAll(): Promise<BusinessStructure[]> {
    return this.repository.findAll();
  }

  async findById(id: number): Promise<BusinessStructure | null> {
    return this.repository.findById(id);
  }

  async updateAllSharing(isShared: boolean): Promise<void> {
    if (this.repository.updateAllSharing) {
      await this.repository.updateAllSharing(isShared);
    } else {
      await this.repository.repo.manager.query(
        `UPDATE "Gnr"."BusinessStructure" SET "IsBasicInfoShared" = $1 WHERE "BusinessStructureID" > 0`,
        [isShared]
      );
    }
    if (!isShared) {
      const all = await this.repository.findAll();
      const companies = all.filter(c => Number(c.businessStructure) === 2 && c.businessStructureId > 1);
      for (const comp of companies) {
        try {
          await this.seedInitializerService.initializeSeeds(comp.businessStructureId);
        } catch (e) {
          console.error(`Error initializing seeds for company ${comp.businessStructureId} on unshare:`, e);
        }
      }
    }
  }

  async update(id: number, dto: UpdateBusinessStructureDto, companyId: number = 2): Promise<BusinessStructure> {
    const res = await this.repository.update(id, { ...dto, companyRef: companyId } as any);
    if (dto.isBasicInfoShared !== undefined) {
      const isShared = dto.isBasicInfoShared === true || String(dto.isBasicInfoShared) === 'true';
      await this.updateAllSharing(isShared);
    }
    return res;
  }

  async delete(id: number): Promise<void> {
    const item = await this.repository.findById(id);
    if (!item) {
      throw new BadRequestException('Item not found');
    }
    if (item.isSystem) {
      throw new BadRequestException('Cannot delete system default records');
    }
    
    // Check if it has children
    const all = await this.repository.findAll();
    const children = all.filter(c => c.parentRef === id);
    if (children.length > 0) {
       throw new BadRequestException('Cannot delete a record that has children');
    }

    // Try to remove default seeded information first
    const unseedRes = await this.seedInitializerService.unseedAll(id);
    if (!unseedRes.success) {
       throw new BadRequestException(unseedRes.message);
    }

    await this.repository.delete(id);
  }
}
