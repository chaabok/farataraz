import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { VoucherType } from '../../domain/entities/voucher-type.entity';
import { CreateVoucherTypeDto } from '../dtos/create-voucher-type.dto';
import { IVoucherTypeRepository, IVoucherTypeRepositoryToken } from '../../domain/repositories/voucher-type.repository.interface';

@Injectable()
export class VoucherTypeService {
  constructor(
    @Inject(IVoucherTypeRepositoryToken)
    private readonly voucherTypeRepository: IVoucherTypeRepository,
  ) {}

  async create(createDto: CreateVoucherTypeDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<VoucherType> {
    const manager = (this.voucherTypeRepository as any).typeOrmRepo.manager;
    const structures = await manager.query(
      `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1`,
      [companyId]
    );
    
    let businessStructureRef = companyId;
    if (structures && structures.length > 0) {
      const bs = structures[0];
      const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
      const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
      if (bsType === 2 && parentRef > 0 && parentRef !== 1) { // 2 = Company
        businessStructureRef = parentRef;
      }
    }

    const data: any = { ...createDto, businessStructureRef, companyRef: companyId };
    if (branchId !== undefined) data.branchRef = branchId;
    if (agencyId !== undefined) data.agencyRef = agencyId;
    return this.voucherTypeRepository.create(data);
  }

  async update(id: number, updateDto: any, companyId: number = 2, branchId?: number, agencyId?: number): Promise<VoucherType> {
    await this.findOne(id); // check exist
    return this.voucherTypeRepository.update(id, updateDto as any);
  }

  async findAll(): Promise<VoucherType[]> {
    return this.voucherTypeRepository.findAll();
  }

  async findWithPagination(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<{ items: VoucherType[], total: number }> {
    const [items, total] = await this.voucherTypeRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<VoucherType> {
    const type = await this.voucherTypeRepository.findById(id);
    if (!type) {
      throw new NotFoundException(`VoucherType with ID ${id} not found`);
    }
    return type;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // will throw 404 if not found
    await this.voucherTypeRepository.delete(id);
  }

  async seedData(): Promise<void> {
    await this.seedForBusinessStructure(1);
  }

  async seedForBusinessStructure(businessStructureId: number): Promise<void> {
    const seedItems = [
      { code: 1, title: 'سند عادی' },
      { code: 2, title: 'سند افتتاحیه' },
      { code: 3, title: 'سند اختتامیه' },
      { code: 4, title: 'سند بستن حساب‌ها' },
      { code: 5, title: 'سند سود و زیان' },
      { code: 6, title: 'سند انتقال' },
      { code: 7, title: 'اصلاح حساب' },
      { code: 8, title: 'حقوق و دستمزد' },
      { code: 9, title: 'هزینه‌های عمومی' },
    ];

    const manager = (this.voucherTypeRepository as any).typeOrmRepo.manager;
    const structures = await manager.query(
      `SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
      [businessStructureId]
    );
    
    let businessStructureRef = businessStructureId;
    let isShared = true;
    if (structures && structures.length > 0) {
      const bs = structures.find((r: any) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === businessStructureId) || structures[0];
      const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
      const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
      
      let targetForSharingCheck = bs;
      if (bsType === 2 && parentRef > 0 && parentRef !== 1) { // 2 = Company
        businessStructureRef = parentRef;
        const parents = await manager.query(
          `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
          [parentRef]
        );
        if (parents && parents.length > 0) {
          targetForSharingCheck = parents.find((r: any) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === parentRef) || parents[0];
        }
      }
      
      const val = targetForSharingCheck.IsBasicInfoShared !== undefined ? targetForSharingCheck.IsBasicInfoShared : targetForSharingCheck.isBasicInfoShared;
      isShared = !(val === false || val === 0 || val === 'false' || val === null);
    }

    const checkField = isShared ? 'BusinessStructureRef' : 'CompanyRef';
    const checkValue = isShared ? businessStructureRef : businessStructureId;

    for (const item of seedItems) {
      try {
        const existing = await manager.query(
          `SELECT COUNT(*) as count FROM "Acc"."VoucherType" WHERE "Title" = $1 AND "${checkField}" = $2`,
          [item.title, checkValue]
        );
        
        if (parseInt(existing[0].count, 10) === 0) {
          await this.create({
            code: item.code,
            title: item.title,
            isActive: true
          } as any, businessStructureId);
          console.log(`Seeded VoucherType: ${item.title} for BS: ${businessStructureId}`);
        }
      } catch (e: any) {
        console.error(`Error seeding VoucherType ${item.title}:`, e.message);
      }
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.voucherTypeRepository.checkDuplicate(field, value, excludeId);
  }
}
