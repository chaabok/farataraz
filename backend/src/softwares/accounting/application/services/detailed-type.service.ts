import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { DetailedType } from '../../domain/entities/detailed-type.entity';
import { CreateDetailedTypeDto } from '../dtos/create-detailed-type.dto';
import { UpdateDetailedTypeDto } from '../dtos/update-detailed-type.dto';
import { IDetailedTypeRepository, IDetailedTypeRepositoryToken } from '../../domain/repositories/detailed-type.repository.interface';
import { IDetailedAccountRepository, IDetailedAccountRepositoryToken } from '../../domain/repositories/detailed-account.repository.interface';
import { IDetailedAccountsNumberingRepository, IDetailedAccountsNumberingRepositoryToken } from '../../../common/domain/repositories/detailed-accounts-numbering.repository.interface';

@Injectable()
export class DetailedTypeService {
  constructor(
    @Inject(IDetailedTypeRepositoryToken)
    private readonly detailedTypeRepository: IDetailedTypeRepository,
    @Inject(IDetailedAccountRepositoryToken)
    private readonly detailedAccountRepository: IDetailedAccountRepository,
    @Inject(IDetailedAccountsNumberingRepositoryToken)
    private readonly detailedAccountsNumberingRepository: IDetailedAccountsNumberingRepository,
  ) {}

  async create(createDto: CreateDetailedTypeDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<DetailedType> {
    const manager = (this.detailedTypeRepository as any).typeOrmRepo.manager;
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
    return this.detailedTypeRepository.create(data);
  }

  async update(id: number, updateDto: UpdateDetailedTypeDto, companyId: number = 2, branchId?: number, agencyId?: number): Promise<DetailedType> {
    await this.findOne(id); // check existence
    // We don't change refs on update usually, but if needed we should follow same logic.
    // For now keep it simple and just update content.
    return this.detailedTypeRepository.update(id, updateDto as any);
  }

  async findAll(): Promise<DetailedType[]> {
    return this.detailedTypeRepository.findAll();
  }

  async findWithPagination(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<{ items: DetailedType[], total: number }> {
    const [items, total] = await this.detailedTypeRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<DetailedType> {
    const type = await this.detailedTypeRepository.findById(id);
    if (!type) {
      throw new NotFoundException(`DetailedType with ID ${id} not found`);
    }
    return type;
  }

  async remove(id: number): Promise<void> {
    if (id >= 1 && id <= 21) {
      throw new Error('This system-defined detailed type cannot be deleted.');
    }
    
    await this.findOne(id); // will throw 404 if not found

    // Check if any DetailedAccount exists for this type
    const accountsCount = await this.detailedAccountRepository.countByDetailedTypeId(id);

    if (accountsCount > 0) {
      throw new BadRequestException('حذف نوع تفصیلی بدلیل وجود حساب تفصیلی امکان پذیر نمی باشد.');
    }

    // Delete from numbering first
    await this.detailedAccountsNumberingRepository.deleteByDetailedTypeId(id);

    // Then delete the type
    await this.detailedTypeRepository.delete(id);
  }

  async seedData(): Promise<void> {
    await this.seedForBusinessStructure(1);
  }

  async seedForBusinessStructure(businessStructureId: number): Promise<void> {
    const seedItems = [
      { code: '1', title: 'حساب بانکی' },
      { code: '2', title: 'صندوق' },
      { code: '3', title: 'کارتخوان' },
      { code: '4', title: 'درگاه های اینترنتی' },
      { code: '5', title: 'تنخواه گردان' },
      { code: '6', title: 'اشخاص حقیقی' },
      { code: '7', title: 'اشخاص حقوقی' },
      { code: '8', title: 'پروژه' },
      { code: '9', title: 'قرارداد' },
      { code: '10', title: 'انبار' },
      { code: '11', title: 'کالاها و خدمات' },
      { code: '12', title: 'اعتبارات اسنادی' },
      { code: '13', title: 'گروه مشتریان' },
      { code: '14', title: 'گروه تامین کنندگان' },
      { code: '15', title: 'مراکز هزینه' },
      { code: '16', title: 'تسهیلات مالی' },
      { code: '17', title: 'دارایی های ثابت' },
      { code: '18', title: 'سایر' },
      { code: '19', title: 'گروه بندی کالا انبار' },
      { code: '20', title: 'گروه بندی کالا فروش' },
      { code: '21', title: 'کانال فروش' },
    ];

    const manager = (this.detailedTypeRepository as any).typeOrmRepo.manager;

    // --- Self-healing dedupe of the system types -----------------------------
    // The old existence check matched rows per BusinessStructureRef/CompanyRef,
    // while the repository always persists system types under the default scope
    // (BusinessStructureRef=2 / CompanyRef=2). Any context change (boot seed
    // with BS=1, view seed with BS=2, double boot, ...) failed that check and
    // inserted a full duplicate copy of the 21 system types on every run.
    // System types are global constants: they must exist exactly once, so we
    // remap every reference to the oldest record and remove the duplicates.
    try {
      const systemTitles = seedItems.map(i => i.title);
      const allTypes: Array<any> = await manager.query(
        `SELECT "DetailedTypesID", "Title" FROM "Acc"."DetailedTypes" WHERE "Title" = ANY($1)`,
        [systemTitles]
      );

      const groups = new Map<string, number[]>();
      for (const row of allTypes) {
        const key = (row.Title || '').trim();
        const id = parseInt(row.DetailedTypesID !== undefined && row.DetailedTypesID !== null ? row.DetailedTypesID.toString() : '0', 10);
        if (!key || !id) continue;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(id);
      }

      for (const ids of groups.values()) {
        if (ids.length <= 1) continue;
        ids.sort((a, b) => a - b);
        const keepId = ids[0];
        const dupIds = ids.slice(1);

        // 1) Detailed accounts created for a duplicate type move to the kept type
        await manager.query(
          `UPDATE "Acc"."DetailedAccounts" SET "DetailedTypesID" = $1::bigint WHERE "DetailedTypesID" = ANY($2::bigint[])`,
          [keepId, dupIds]
        );

        // 2) Numbering settings: keep a single row per type. If the kept type
        //    already owns one, drop the duplicate rows; otherwise move them.
        const keptRows = await manager.query(
          `SELECT COUNT(*) as count FROM "Gnr"."DetailedAccountsNumbering" WHERE "DetailedTypesID" = $1::bigint`,
          [keepId]
        );
        if (parseInt(keptRows[0]?.count ?? '0', 10) > 0) {
          await manager.query(
            `DELETE FROM "Gnr"."DetailedAccountsNumbering" WHERE "DetailedTypesID" = ANY($1::bigint[])`,
            [dupIds]
          );
        } else {
          await manager.query(
            `UPDATE "Gnr"."DetailedAccountsNumbering" SET "DetailedTypesID" = $1::bigint WHERE "DetailedTypesID" = ANY($2::bigint[])`,
            [keepId, dupIds]
          );
        }

        // 3) Finally remove the duplicate type records (safety net: skip any
        //    row that is still referenced by a detailed account)
        await manager.query(
          `DELETE FROM "Acc"."DetailedTypes" t
           WHERE t."DetailedTypesID" = ANY($1::bigint[])
             AND NOT EXISTS (
               SELECT 1 FROM "Acc"."DetailedAccounts" da WHERE da."DetailedTypesID" = t."DetailedTypesID"
             )`,
          [dupIds]
        );

        console.log(`DetailedTypes dedupe: kept ID ${keepId}, removed duplicates [${dupIds.join(', ')}]`);
      }
    } catch (e: any) {
      console.error('DetailedTypes dedupe failed:', e.message);
    }

    for (const item of seedItems) {
      try {
        // Ref-agnostic existence check: system types are global constants and
        // the repository always stores them under the default scope, so match
        // by Title or Code instead of BusinessStructureRef/CompanyRef. This
        // keeps re-seeding idempotent (no duplicate copies ever again).
        const existing = await manager.query(
          `SELECT COUNT(*) as count FROM "Acc"."DetailedTypes" WHERE "Title" = $1 OR "Code" = $2`,
          [item.title, item.code]
        );

        if (parseInt(existing[0].count, 10) === 0) {
          await this.create({
            code: item.code,
            title: item.title,
            isActive: true
          } as any, businessStructureId);
          console.log(`Seeded DetailedType: ${item.title} for BS: ${businessStructureId}`);
        }
      } catch (e: any) {
        console.error(`Error seeding DetailedType ${item.title}:`, e.message);
      }
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.detailedTypeRepository.checkDuplicate(field, value, excludeId);
  }
}
