import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClosingTemporaryAccount } from '../../domain/entities/closing-temporary-account.entity';
import { ClosingTemporaryAccountItem } from '../../domain/entities/closing-temporary-account-item.entity';
import { ClosingTemporaryAccountSelected } from '../../domain/entities/closing-temporary-account-selected.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { Voucher } from '../../domain/entities/voucher.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

export interface TemporaryTreeNode {
  id: string;
  name: string;
  code?: string;
  title?: string;
  accountType?: number;
  balance?: number;
  children?: TemporaryTreeNode[];
  isRoot?: boolean;
}

@Injectable()
export class ClosingTemporaryAccountService {
  constructor(
    @InjectRepository(ClosingTemporaryAccount)
    private readonly repo: Repository<ClosingTemporaryAccount>,
    @InjectRepository(ClosingTemporaryAccountItem)
    private readonly itemRepo: Repository<ClosingTemporaryAccountItem>,
    @InjectRepository(ClosingTemporaryAccountSelected)
    private readonly selectedRepo: Repository<ClosingTemporaryAccountSelected>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(DetailedAccount)
    private readonly detailedAccountRepo: Repository<DetailedAccount>,
    @InjectRepository(VoucherItem)
    private readonly voucherItemRepo: Repository<VoucherItem>,
    private readonly idGen: IdGenerationService,
    private readonly reqCtx: RequestContextService,
    private readonly dataSource: DataSource,
  ) {}

  private getScope() {
    let bsId = this.reqCtx.getBusinessStructureId() ?? 2;
    let compId = this.reqCtx.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    return { bsId, compId };
  }

  /**
   * دریافت درخت حساب‌های موقت (سود و زیانی) که ریز تفصیلی آن‌ها دارای مانده باشند.
   */
  async getTemporaryAccountsTree(toDate?: string): Promise<TemporaryTreeNode> {
    const { bsId, compId } = this.getScope();

    // 1. All accounts in system
    const allAccounts = await this.accountRepo.find({
      where: [
        { businessStructureRef: bsId },
        { companyRef: compId }
      ],
      order: { code: 'ASC' }
    });

    // Determine group account type (1=Balance Sheet, 2=Profit & Loss, 3=Off-balance)
    const getGroupType = (acc: Account): number | undefined => {
      if (acc.accountType !== null && acc.accountType !== undefined && Number(acc.accountType) > 0) {
        return Number(acc.accountType);
      }
      let current: Account | undefined = acc;
      while (current && current.parentId) {
        const parent = allAccounts.find(x => Number(x.id) === Number(current!.parentId));
        if (parent) {
          if (parent.accountType !== null && parent.accountType !== undefined && Number(parent.accountType) > 0) {
            return Number(parent.accountType);
          }
          current = parent;
        } else {
          break;
        }
      }
      return undefined;
    };

    // Filter accounts whose group type is Profit & Loss (2)
    const profitLossAccounts = allAccounts.filter(acc => getGroupType(acc) === 2);
    const pnlAccountIds = profitLossAccounts.map(a => Number(a.id));

    if (pnlAccountIds.length === 0) {
      return {
        id: 'root',
        name: 'حساب‌های سود و زیانی دارای مانده',
        isRoot: true,
        children: []
      };
    }

    // Query voucher items to calculate balances up to toDate
    const qb = this.voucherItemRepo.createQueryBuilder('vi')
      .leftJoin('vi.voucher', 'v')
      .where('vi.accountId IN (:...pnlAccountIds)', { pnlAccountIds });

    if (toDate && toDate.trim() !== '') {
      qb.andWhere('v.voucherDate <= :toDate', { toDate });
    }

    const items = await qb.getMany();

    // Group voucher items by accountId and detailedAccountId
    // AccountId -> Map<DetailedAccountId, { debit, credit }>
    const balancesMap = new Map<number, {
      totalDebit: number;
      totalCredit: number;
      detailedBalances: Map<number, { debit: number; credit: number }>;
    }>();

    for (const item of items) {
      const accId = Number(item.accountId);
      if (!balancesMap.has(accId)) {
        balancesMap.set(accId, {
          totalDebit: 0,
          totalCredit: 0,
          detailedBalances: new Map(),
        });
      }
      const entry = balancesMap.get(accId)!;
      const debit = Number(item.debit || 0);
      const credit = Number(item.credit || 0);

      entry.totalDebit += debit;
      entry.totalCredit += credit;

      // Check detailed accounts (level 1..10)
      const detIds = [
        item.detailedAccountId1, item.detailedAccountId2, item.detailedAccountId3,
        item.detailedAccountId4, item.detailedAccountId5, item.detailedAccountId6,
        item.detailedAccountId7, item.detailedAccountId8, item.detailedAccountId9,
        item.detailedAccountId10
      ].filter(Boolean).map(x => Number(x));

      for (const detId of detIds) {
        if (!entry.detailedBalances.has(detId)) {
          entry.detailedBalances.set(detId, { debit: 0, credit: 0 });
        }
        const detEntry = entry.detailedBalances.get(detId)!;
        detEntry.debit += debit;
        detEntry.credit += credit;
      }
    }

    // Fetch all detailed accounts names if needed
    const allDetIds = new Set<number>();
    balancesMap.forEach(e => {
      e.detailedBalances.forEach((_, detId) => allDetIds.add(detId));
    });

    let detailedAccountsList: DetailedAccount[] = [];
    if (allDetIds.size > 0) {
      detailedAccountsList = await this.detailedAccountRepo.createQueryBuilder('da')
        .where('da.detailedAccountId IN (:...detIds)', { detIds: Array.from(allDetIds) })
        .getMany();
    }
    const detailedMap = new Map<number, DetailedAccount>(detailedAccountsList.map(d => [Number(d.detailedAccountId), d]));

    // Build tree structure
    const treeChildren: TemporaryTreeNode[] = [];

    // Filter pnl accounts with non-zero total or detailed balance
    for (const acc of profitLossAccounts) {
      const accId = Number(acc.id);
      const accBalanceInfo = balancesMap.get(accId);

      // If no voucher items exist for this account, or balance is zero with no detailed items, check if we should skip
      const moinDebit = accBalanceInfo?.totalDebit || 0;
      const moinCredit = accBalanceInfo?.totalCredit || 0;
      const moinBalance = moinDebit - moinCredit;

      const detailedNodes: TemporaryTreeNode[] = [];
      if (accBalanceInfo && accBalanceInfo.detailedBalances.size > 0) {
        accBalanceInfo.detailedBalances.forEach((detBal, detId) => {
          const detNet = detBal.debit - detBal.credit;
          if (Math.abs(detNet) > 0.0001) {
            const detObj = detailedMap.get(detId);
            const detCode = detObj?.code || String(detId);
            const detTitle = detObj?.title || `تفصیلی ${detCode}`;
            detailedNodes.push({
              id: `${acc.code}_det_${detId}`,
              name: `${detCode} - ${detTitle} (مانده: ${detNet.toLocaleString('fa-IR')})`,
              code: detCode,
              title: detTitle,
              balance: detNet
            });
          }
        });
      }

      if (Math.abs(moinBalance) > 0.0001 || detailedNodes.length > 0) {
        treeChildren.push({
          id: acc.code,
          name: `${acc.code} - ${acc.title} (مانده: ${moinBalance.toLocaleString('fa-IR')})`,
          code: acc.code,
          title: acc.title,
          balance: moinBalance,
          children: detailedNodes
        });
      }
    }

    return {
      id: 'root',
      name: 'حساب‌ها',
      isRoot: true,
      children: treeChildren
    };
  }

  async findAll(): Promise<ClosingTemporaryAccount[]> {
    const { bsId, compId } = this.getScope();
    return this.repo.find({
      where: [
        { businessStructureRef: bsId },
        { companyRef: compId }
      ],
      relations: ['items', 'selectedAccounts'],
      order: { id: 'DESC' }
    });
  }

  async findOne(id: number): Promise<ClosingTemporaryAccount> {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['items', 'selectedAccounts']
    });
    if (!item) throw new NotFoundException('رکورد بستن حسابهای موقت یافت نشد');
    return item;
  }

  async create(dto: any): Promise<ClosingTemporaryAccount> {
    const { bsId, compId } = this.getScope();
    const nextId = await this.idGen.generateNextId('ClosingTemporaryAccount');

    const entity = this.repo.create({
      id: nextId,
      description: dto.description,
      toDate: dto.toDate,
      type: dto.type,
      status: dto.status || 'صادر نشده',
      businessStructureRef: bsId,
      companyRef: compId,
    });

    if (dto.items && dto.items.length > 0) {
      const itemsCount = dto.items.length;
      const startItemId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountItem', itemsCount);
      entity.items = dto.items.map((item: any, idx: number) => this.itemRepo.create({
        id: startItemId + idx,
        closingTemporaryAccountRef: nextId,
        intermediaryAccountRef: item.intermediaryAccountRef,
        intermediaryCode: item.intermediaryCode,
        percentage: item.percentage,
        detailedAccountRef1: item.detailedAccountRef1,
        detailedAccountRef2: item.detailedAccountRef2,
        detailedAccountRef3: item.detailedAccountRef3,
      }));
    }

    if (dto.selectedAccounts && dto.selectedAccounts.length > 0) {
      const selCount = dto.selectedAccounts.length;
      const startSelId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountSelected', selCount);
      entity.selectedAccounts = dto.selectedAccounts.map((sel: any, idx: number) => this.selectedRepo.create({
        id: startSelId + idx,
        closingTemporaryAccountRef: nextId,
        accountRef: sel.accountRef,
        accountCode: sel.accountCode,
        accountTitle: sel.accountTitle,
        detailedAccountRef: sel.detailedAccountRef,
      }));
    }

    return this.repo.save(entity);
  }

  async update(id: number, dto: any): Promise<ClosingTemporaryAccount> {
    const existing = await this.findOne(id);
    
    existing.description = dto.description ?? existing.description;
    existing.toDate = dto.toDate ?? existing.toDate;
    existing.type = dto.type ?? existing.type;
    existing.status = dto.status ?? existing.status;

    if (dto.items) {
      await this.itemRepo.delete({ closingTemporaryAccountRef: id });
      const itemsCount = dto.items.length;
      if (itemsCount > 0) {
        const startItemId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountItem', itemsCount);
        existing.items = dto.items.map((item: any, idx: number) => this.itemRepo.create({
          id: startItemId + idx,
          closingTemporaryAccountRef: id,
          intermediaryAccountRef: item.intermediaryAccountRef,
          intermediaryCode: item.intermediaryCode,
          percentage: item.percentage,
          detailedAccountRef1: item.detailedAccountRef1,
          detailedAccountRef2: item.detailedAccountRef2,
          detailedAccountRef3: item.detailedAccountRef3,
        }));
      } else {
        existing.items = [];
      }
    }

    if (dto.selectedAccounts) {
      await this.selectedRepo.delete({ closingTemporaryAccountRef: id });
      const selCount = dto.selectedAccounts.length;
      if (selCount > 0) {
        const startSelId = await this.idGen.generateNextIdBlock('ClosingTemporaryAccountSelected', selCount);
        existing.selectedAccounts = dto.selectedAccounts.map((sel: any, idx: number) => this.selectedRepo.create({
          id: startSelId + idx,
          closingTemporaryAccountRef: id,
          accountRef: sel.accountRef,
          accountCode: sel.accountCode,
          accountTitle: sel.accountTitle,
          detailedAccountRef: sel.detailedAccountRef,
        }));
      } else {
        existing.selectedAccounts = [];
      }
    }

    return this.repo.save(existing);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
