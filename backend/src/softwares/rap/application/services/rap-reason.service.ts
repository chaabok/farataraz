import { Injectable, Inject, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { IRapReasonRepository, IRapReasonRepositoryToken } from '../../domain/repositories/rap-reason.repository.interface';
import { CreateRapReasonDto } from '../dtos/create-rap-reason.dto';
import { UpdateRapReasonDto } from '../dtos/update-rap-reason.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RapReasonNature } from '../../domain/entities/rap-reason.entity';
import { UsageCheckService } from '../../../../core/services/usage-check.service';

@Injectable()
export class RapReasonService {
  constructor(
    @Inject(IRapReasonRepositoryToken)
    private readonly rapReasonRepository: IRapReasonRepository,
    private readonly dataSource: DataSource,
    private readonly idGenerationService: IdGenerationService,
    private readonly usageCheckService: UsageCheckService,
  ) {}

    private async isBasicInfoShared(businessStructureId: number): Promise<boolean> {
      const q = `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`;
      const rows = await this.dataSource.query(q, [businessStructureId]);
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          return false;
        }
        return true;
      }
      return false;
    }

  async create(data: CreateRapReasonDto, authContext: { businessStructureId: number; companyId: number }) {
    const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
    
    // Check for uniqueness (Rule 1)
    const existingList = await this.rapReasonRepository.findAll(authContext, isShared);
    if (data.Code) {
       const existingCode = existingList.find(r => r.Code === data.Code);
       if (existingCode) {
           throw new BadRequestException("کد وارد شده تکراری است");
       }
    }
    if (data.Title) {
        const existingTitle = existingList.find(r => r.Title === data.Title);
        if (existingTitle) {
            throw new BadRequestException("عنوان وارد شده تکراری است");
        }
    }
    
    const bsRef = authContext.businessStructureId <= 1 ? 2 : authContext.businessStructureId;
    const companyRef = authContext.companyId <= 1 ? 2 : authContext.companyId;

    const newId = await this.idGenerationService.generateNextId('RapReason');

    const obj = {
      ...data,
      RapReasonID: newId,
      businessStructureRef: bsRef,
      companyRef: companyRef,
    };

    return await this.rapReasonRepository.create(obj);
  }

  async ensureDefaultReasons(authContext: { businessStructureId: number; companyId: number }) {
      const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
      const all = await this.rapReasonRepository.findAll(authContext, isShared);
      
      const bsRef = authContext.businessStructureId <= 1 ? 2 : authContext.businessStructureId;
      const companyRef = authContext.companyId <= 1 ? 2 : authContext.companyId;

      if (all.length === 0) {
          // Add default Sources and Uses
          const sourceId = await this.idGenerationService.generateNextId('RapReason');
          await this.rapReasonRepository.create({
              RapReasonID: sourceId,
              Title: 'منابع',
              Title_En: 'Sources',
              Nature: RapReasonNature.SOURCE,
              IsActive: true,
              businessStructureRef: bsRef,
              companyRef: companyRef,
          });

          const useId = await this.idGenerationService.generateNextId('RapReason');
          await this.rapReasonRepository.create({
              RapReasonID: useId,
              Title: 'مصارف',
              Title_En: 'Uses',
              Nature: RapReasonNature.USE,
              IsActive: true,
              businessStructureRef: bsRef,
              companyRef: companyRef,
          });
      }
  }

  async findAll(authContext: { businessStructureId: number; companyId: number }) {
    await this.ensureDefaultReasons(authContext);
    const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
    return await this.rapReasonRepository.findAll(authContext, isShared);
  }

  async findAllTree(authContext: { businessStructureId: number; companyId: number }) {
    await this.ensureDefaultReasons(authContext);
  
    const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
    const all = await this.rapReasonRepository.findAll(authContext, isShared);
    
    // Convert to tree
    const map = new Map<number, any>();
    all.forEach(item => map.set(item.RapReasonID, { ...item, children: [] }));
    
    const tree: any[] = [];
    all.forEach(item => {
      if (item.ParentRef) {
        const parent = map.get(item.ParentRef);
        if (parent) {
          parent.children.push(map.get(item.RapReasonID));
        } else {
            tree.push(map.get(item.RapReasonID));
        }
      } else {
        tree.push(map.get(item.RapReasonID));
      }
    });

    return tree;
  }

  async findOne(id: number, authContext: { businessStructureId: number; companyId: number }) {
    const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
    const entity = await this.rapReasonRepository.findById(id, authContext, isShared);
    if (!entity) throw new NotFoundException('RapReason not found');
    return entity;
  }

  async update(id: number, data: UpdateRapReasonDto, authContext: { businessStructureId: number; companyId: number }) {
    await this.findOne(id, authContext); // check exists

    const usage = await this.usageCheckService.isRecordUsed('RapReason', id);
    if (usage.isUsed) {
      throw new ConflictException(`این بابت در فرم دیگری استفاده شده است و امکان ویرایش آن وجود ندارد.`);
    }
    
    const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
    const existingList = await this.rapReasonRepository.findAll(authContext, isShared);
    
    if (data.Code) {
       const existingCode = existingList.find(r => r.Code === data.Code && Number(r.RapReasonID) !== Number(id));
       if (existingCode) {
           throw new BadRequestException("کد وارد شده تکراری است");
       }
    }
    if (data.Title) {
        const existingTitle = existingList.find(r => r.Title === data.Title && Number(r.RapReasonID) !== Number(id));
        if (existingTitle) {
            throw new BadRequestException("عنوان وارد شده تکراری است");
        }
    }

    return await this.rapReasonRepository.update(id, data);
  }

  async remove(id: number, authContext: { businessStructureId: number; companyId: number }) {
    await this.findOne(id, authContext);

    const usage = await this.usageCheckService.isRecordUsed('RapReason', id);
    if (usage.isUsed) {
      throw new ConflictException(`این بابت در فرم دیگری استفاده شده است و امکان حذف آن وجود ندارد.`);
    }

    await this.rapReasonRepository.delete(id);
  }
}
