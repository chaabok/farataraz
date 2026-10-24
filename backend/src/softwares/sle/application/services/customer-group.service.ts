import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICustomerGroupRepository, ICustomerGroupRepositoryToken } from '../../domain/repositories/customer-group.repository.interface';
import { CustomerGroup } from '../../domain/entities/customer-group.entity';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from '../dtos/customer-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { DetailedType } from '../../../accounting/domain/entities/detailed-type.entity';

@Injectable()
export class CustomerGroupService {
  constructor(
    @Inject(ICustomerGroupRepositoryToken)
    private readonly repository: ICustomerGroupRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
    private readonly usageCheckService: UsageCheckService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.connection.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async findAll(): Promise<CustomerGroup[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.repository.findAll({ where });
  }

  async getTree(): Promise<any> {
    const { bsId, compId, isShared } = await this.getScope();
    let where: any = {};
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }

    let items = await this.repository.findAll({ where });

    if (!items || items.length === 0) {
      const userId = this.requestContextService.getUserId() || 1;
      const rootId = await this.idGenerationService.generateNextId('CustomerGroups');

      await this.repository.create({
        CustomerGroupID: rootId,
        Code: '0',
        Title: 'گروه بندی مشتریان',
        Title2: '',
        Description: '',
        ParentRef: null,
        creator: userId,
        lastModifier: userId,
        companyRef: compId,
        businessStructureRef: bsId,
      });

      items = await this.repository.findAll({ where });
    }

    const map = new Map<number, any>();
    const roots: any[] = [];

    items.forEach(item => {
      map.set(item.CustomerGroupID, {
        id: String(item.CustomerGroupID),
        name: item.Title,
        isRoot: item.ParentRef === null,
        deletable: item.ParentRef !== null,
        data: {
          code: item.Code || '',
          name2: item.Title2 || '',
          detailedAccountRef: item.DetailedAccountRef || null,
          detailedAccountCode: item.detailedAccount?.code || '',
          description: item.Description || '',
          recordId: item.CustomerGroupID,
        },
        children: []
      });
    });

    items.forEach(item => {
      const node = map.get(item.CustomerGroupID);
      if (item.ParentRef === null || !map.has(item.ParentRef)) {
        roots.push(node);
      } else {
        const parentNode = map.get(item.ParentRef);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots.length > 0 ? roots[0] : {
      id: 'root',
      name: 'گروه بندی مشتریان',
      isRoot: true,
      deletable: false,
      data: { code: '0', name2: '', detailedAccountRef: null, description: '', recordId: 0 },
      children: []
    };
  }

  async getNextCode(parentRef?: number): Promise<string> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    
    let targetParentRef = parentRef;
    if (!targetParentRef) {
      const rootNode = await this.repository.manager.findOne(CustomerGroup, {
        where: { ...where, ParentRef: null } as any
      });
      if (rootNode) {
        targetParentRef = rootNode.CustomerGroupID;
      }
    }

    where.ParentRef = targetParentRef ?? null;
    const siblings = await this.repository.findAll({ where });
    let max = 0;
    for (const sib of siblings) {
      const c = parseInt(sib.Code || '0', 10);
      if (!isNaN(c) && c > max) {
        max = c;
      }
    }
    return String(max + 1);
  }

  async checkDuplicate(field: string, value: string, excludeId?: number, parentRef?: number | null): Promise<boolean> {
    if (!value || String(value).trim() === '') return false;
    const { bsId, compId, isShared } = await this.getScope();

    if (field === 'detailedAccountCode') {
      const qb = this.repository.manager.createQueryBuilder(DetailedAccount, 'da');
      qb.where('da.code = :value', { value });
      if (isShared) {
        qb.andWhere('da.businessStructureRef = :bsId', { bsId });
      } else {
        qb.andWhere('da.companyRef = :compId', { compId });
      }
      if (excludeId) {
        const cg = await this.repository.findById(excludeId);
        if (cg && cg.DetailedAccountRef) {
          qb.andWhere('da.detailedAccountId != :detailedAccRef', { detailedAccRef: cg.DetailedAccountRef });
        }
      }
      const count = await qb.getCount();
      return count > 0;
    }

    if (field === 'Title' || field === 'Title2') {
      const qb = this.repository.manager.createQueryBuilder(CustomerGroup, 'cg');
      qb.where(`cg.${field} = :value`, { value });
      if (isShared) {
        qb.andWhere('cg.businessStructureRef = :bsId', { bsId });
      } else {
        qb.andWhere('cg.companyRef = :compId', { compId });
      }
      if (excludeId) {
        qb.andWhere('cg.CustomerGroupID != :excludeId', { excludeId });
      }
      const count = await qb.getCount();
      return count > 0;
    }

    if (field === 'Code') {
      const allGroups = await this.repository.findAll({
        where: isShared ? { businessStructureRef: bsId } : { companyRef: compId }
      });

      const getFullCodeOfGroup = (groupId: number): string => {
        const parts: string[] = [];
        let currId: number | null = groupId;
        while (currId !== null) {
          const g = allGroups.find(x => x.CustomerGroupID === currId);
          if (!g) break;
          parts.unshift(g.Code || '');
          currId = g.ParentRef;
        }
        return parts.join('');
      };

      const getParentFullCode = (pRef: number | null | undefined): string => {
        if (!pRef) return '';
        return getFullCodeOfGroup(pRef);
      };

      let targetParentRef = parentRef;
      if (!targetParentRef) {
        const rootNode = allGroups.find(x => x.ParentRef === null);
        if (rootNode) {
          targetParentRef = rootNode.CustomerGroupID;
        }
      }

      const parentFullCode = getParentFullCode(targetParentRef);
      const targetFullCode = parentFullCode + value;

      for (const g of allGroups) {
        if (excludeId && g.CustomerGroupID === excludeId) continue;
        const gFullCode = getFullCodeOfGroup(g.CustomerGroupID);
        if (gFullCode === targetFullCode) {
          return true;
        }
      }
      return false;
    }

    return false;
  }

  async create(dto: CreateCustomerGroupDto): Promise<CustomerGroup> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;
    const id = dto.CustomerGroupID || (await this.idGenerationService.generateNextId('CustomerGroups'));

    if (!dto.Code || String(dto.Code).trim() === '' || (await this.checkDuplicate('Code', dto.Code, undefined, dto.ParentRef))) {
      dto.Code = await this.getNextCode(dto.ParentRef);
    }
    if (dto.Title && (await this.checkDuplicate('Title', dto.Title))) {
      throw new BadRequestException('عنوان گروه مشتری تکراری است.');
    }
    if (dto.Title2 && (await this.checkDuplicate('Title2', dto.Title2))) {
      throw new BadRequestException('عنوان (2) گروه مشتری تکراری است.');
    }
    if (dto.detailedAccountCode && (await this.checkDuplicate('detailedAccountCode', dto.detailedAccountCode))) {
      throw new BadRequestException('کد تفصیلی گروه مشتری تکراری است.');
    }

    let detailedAccountRef = dto.DetailedAccountRef;
    const detailedTypes = await this.repository.manager.find(DetailedType, {});
    const typeGroup = detailedTypes.find(t => t.code === '13' || t.Code === '13');

    if (!detailedAccountRef && dto.Title) {
      try {
        const detailedAccId = await this.idGenerationService.generateNextId('DetailedAccount');
        const detailedAccCode = dto.detailedAccountCode || dto.Code || detailedAccId.toString();
        const newDetailedAcc = this.repository.manager.create(DetailedAccount, {
          detailedAccountId: detailedAccId,
          code: detailedAccCode,
          title: dto.Title,
          detailedTypesId: typeGroup ? typeGroup.detailedTypesId : null,
          isActive: true,
          creator: userId,
          lastModifier: userId,
          companyRef: compId,
          businessStructureRef: bsId,
        });
        const savedAcc = await this.repository.manager.save(DetailedAccount, newDetailedAcc);
        detailedAccountRef = savedAcc.detailedAccountId;
      } catch (err) {
        console.error('Failed to auto-generate detailed account:', err);
      }
    } else if (detailedAccountRef && dto.detailedAccountCode) {
      await this.repository.manager.update(DetailedAccount, { detailedAccountId: detailedAccountRef }, {
        code: dto.detailedAccountCode,
        title: dto.Title
      });
    }

    const entity = this.repository.manager.create(CustomerGroup, {
      CustomerGroupID: id,
      Code: dto.Code,
      Title: dto.Title,
      Title2: dto.Title2,
      DetailedAccountRef: detailedAccountRef || null,
      Description: dto.Description,
      IsMandatory: dto.IsMandatory,
      ParentRef: dto.ParentRef || null,
      creator: userId,
      lastModifier: userId,
      companyRef: dto.CompanyRef || compId,
      businessStructureRef: dto.BusinessStructureRef || bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateCustomerGroupDto): Promise<CustomerGroup> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`CustomerGroup with ID ${id} not found`);
    }

    const { bsId, compId, isShared } = await this.getScope();
    if (dto.Code !== undefined) {
      if (!dto.Code || String(dto.Code).trim() === '') {
        throw new BadRequestException('فیلد کد الزامی است و نمی‌تواند خالی باشد.');
      }
      const targetParentRef = dto.ParentRef !== undefined && dto.ParentRef !== null ? dto.ParentRef : existing.ParentRef;
      const codeChanged = dto.Code !== existing.Code;
      const parentChanged = dto.ParentRef !== undefined && dto.ParentRef !== null && dto.ParentRef !== existing.ParentRef;

      if ((codeChanged || parentChanged) && (await this.checkDuplicate('Code', dto.Code, id, targetParentRef))) {
        throw new BadRequestException('کد گروه مشتری با احتساب کد سرشاخه تکراری است.');
      }
    }
    if (dto.Title && dto.Title !== existing.Title && (await this.checkDuplicate('Title', dto.Title, id))) {
      throw new BadRequestException('عنوان گروه مشتری تکراری است.');
    }
    if (dto.Title2 && dto.Title2 !== existing.Title2 && (await this.checkDuplicate('Title2', dto.Title2, id))) {
      throw new BadRequestException('عنوان (2) گروه مشتری تکراری است.');
    }
    if (dto.detailedAccountCode && (await this.checkDuplicate('detailedAccountCode', dto.detailedAccountCode, id))) {
      throw new BadRequestException('کد تفصیلی گروه مشتری تکراری است.');
    }

    if (existing.DetailedAccountRef && (dto.detailedAccountCode || dto.Title)) {
      try {
        await this.repository.manager.update(DetailedAccount, { detailedAccountId: existing.DetailedAccountRef }, {
          ...(dto.detailedAccountCode ? { code: dto.detailedAccountCode } : {}),
          ...(dto.Title ? { title: dto.Title } : {})
        });
      } catch (err) {
        console.error('Failed to update associated detailed account:', err);
      }
    }

    const { detailedAccountCode, RelatedParties, relatedParties, ...restDto } = dto as any;

    const userId = this.requestContextService.getUserId() || 1;
    Object.assign(existing, {
      ...restDto,
      lastModifier: userId,
    });

    return this.repository.update(id, existing);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`CustomerGroup with ID ${id} not found`);
    }

    const children = await this.repository.findAll({ where: { ParentRef: id } });
    if (children && children.length > 0) {
      throw new BadRequestException('این گروه دارای زیرمجموعه است و امکان حذف آن وجود ندارد.');
    }

    const detailedAccRef = existing.DetailedAccountRef;

    if (detailedAccRef) {
      const usage = await this.usageCheckService.isRecordUsed('DetailedAccounts', detailedAccRef);
      if (usage.isUsed) {
        throw new BadRequestException(`این آیتم در جدول/سند «${usage.usedInTable || 'سایر فرم‌ها'}» استفاده شده است و امکان حذف آن وجود ندارد.`);
      }
    }

    await this.repository.delete(id);

    if (detailedAccRef) {
      try {
        await this.repository.manager.delete(DetailedAccount, { detailedAccountId: detailedAccRef });
      } catch (err) {
        console.error('Failed to delete associated detailed account:', err);
      }
    }
  }

  async findById(id: number): Promise<CustomerGroup> {
    const group = await this.repository.findById(id);
    if (!group) {
      throw new NotFoundException(`CustomerGroup with ID ${id} not found`);
    }
    return group;
  }

  async upsert(dto: CreateCustomerGroupDto): Promise<CustomerGroup> {
    const { bsId, compId, isShared } = await this.getScope();

    if (dto.CustomerGroupID) {
      const existing = await this.repository.findById(dto.CustomerGroupID);
      if (existing) {
        return this.update(dto.CustomerGroupID, dto as UpdateCustomerGroupDto);
      }
    }

    if (dto.Code) {
      const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
      if (dto.ParentRef !== undefined) {
        where.ParentRef = dto.ParentRef;
      }
      where.Code = dto.Code;

      const existingByCode = await this.repository.findAll({ where });
      if (existingByCode && existingByCode.length > 0) {
        return this.update(existingByCode[0].CustomerGroupID, dto as UpdateCustomerGroupDto);
      }
    }

    return this.create(dto);
  }
}
