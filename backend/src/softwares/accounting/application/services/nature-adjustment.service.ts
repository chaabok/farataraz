import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from '../../domain/entities/voucher.entity';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { VoucherService } from './voucher.service';
import { AccountService } from './account.service';

@Injectable()
export class NatureAdjustmentService {
  constructor(
    @InjectRepository(VoucherItem)
    private readonly voucherItemRepository: Repository<VoucherItem>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(DetailedAccount)
    private readonly detailedAccountRepository: Repository<DetailedAccount>,
    private readonly requestContextService: RequestContextService,
    private readonly voucherService: VoucherService,
    private readonly accountService: AccountService,
  ) {}

  private async getScopeWhere(bsId: number, compId: number) {
    let isShared = true;
    try {
      const rows = await this.accountRepository.manager.query(
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
    } catch (e) {
      isShared = false;
    }
    return isShared ? { businessStructureRef: bsId } : { companyRef: compId };
  }

  async getContraryBalances(fiscalYearId: number) {
    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;

    const whereScope = await this.getScopeWhere(bsId, compId);

    // Get all accounts
    const accounts = await this.accountRepository.find({
      where: whereScope
    });
    const accountMap = new Map<number, Account>();
    accounts.forEach(a => accountMap.set(a.id, a));

    // Get detailed accounts
    const details = await this.detailedAccountRepository.find({
      where: whereScope
    });
    const detailMap = new Map<number, DetailedAccount>();
    details.forEach(d => detailMap.set(d.detailedAccountId, d));

    // Get currencies
    const currencies = await this.voucherItemRepository.manager.query('SELECT "CurrencyID", "Title" FROM "Gnr"."Currency"');
    const currencyMap = new Map<number, string>();
    currencies.forEach((c: any) => currencyMap.set(Number(c.CurrencyID), c.Title));

    // Get all active voucher items for the fiscal year
    const qb = this.voucherItemRepository.createQueryBuilder('vi')
      .innerJoin('vi.voucher', 'v')
      .where('(v.fiscalYearRef = :fy OR v.fiscalYearRef IS NULL)', { fy: fiscalYearId })
      .andWhere('v.businessStructureRef = :bs', { bs: bsId })
      .andWhere('v.companyRef = :comp', { comp: compId })
      .select([
        'vi.accountId as "accountId"',
        'vi.detailedAccountId1 as "detailedAccountId1"',
        'vi.detailedAccountId2 as "detailedAccountId2"',
        'vi.detailedAccountId3 as "detailedAccountId3"',
        'vi.currencyId as "currencyId"',
        'SUM(vi.debit) as "totalDebit"',
        'SUM(vi.credit) as "totalCredit"',
      ])
      .groupBy('vi.accountId')
      .addGroupBy('vi.detailedAccountId1')
      .addGroupBy('vi.detailedAccountId2')
      .addGroupBy('vi.detailedAccountId3')
      .addGroupBy('vi.currencyId');

    const rawResults = await qb.getRawMany();
    const contraryLines: any[] = [];

    rawResults.forEach((row, idx) => {
      const accId = Number(row.accountId);
      const acc = accountMap.get(accId);
      if (!acc) return;
      
      const nature = acc.accountNature;
      // Skip if neutral/unspecified (7 or null/undefined)
      if (!nature || nature === 7) return;

      const tDebit = Number(row.totalDebit) || 0;
      const tCredit = Number(row.totalCredit) || 0;
      const balance = tDebit - tCredit;
      
      let balanceNature = '';
      if (balance > 0) balanceNature = 'بدهکار';
      else if (balance < 0) balanceNature = 'بستانکار';
      else return; // Zero balance

      // Determine if it is a debit nature or credit nature
      // 1: بدهکار, 3: بدهکار طی دوره, 5: بدهکار پایان دوره
      // 2: بستانکار, 4: بستانکار طی دوره, 6: بستانکار پایان دوره
      const isDebitNature = nature === 1 || nature === 3 || nature === 5;
      const isCreditNature = nature === 2 || nature === 4 || nature === 6;

      let isContrary = false;
      if (isDebitNature && balance < 0) isContrary = true;
      if (isCreditNature && balance > 0) isContrary = true;

      if (isContrary) {
        let accountNatureStr = 'مهم نیست';
        if (nature === 1) accountNatureStr = 'بدهکار';
        else if (nature === 2) accountNatureStr = 'بستانکار';
        else if (nature === 3) accountNatureStr = 'بدهکار طی دوره';
        else if (nature === 4) accountNatureStr = 'بستانکار طی دوره';
        else if (nature === 5) accountNatureStr = 'بدهکار پایان دوره';
        else if (nature === 6) accountNatureStr = 'بستانکار پایان دوره';

        const da1 = row.detailedAccountId1 ? detailMap.get(Number(row.detailedAccountId1)) : null;
        const da2 = row.detailedAccountId2 ? detailMap.get(Number(row.detailedAccountId2)) : null;
        const da3 = row.detailedAccountId3 ? detailMap.get(Number(row.detailedAccountId3)) : null;

        const kolAcc = acc.parentId ? accountMap.get(Number(acc.parentId)) : null;
        const groupAcc = kolAcc && kolAcc.parentId ? accountMap.get(Number(kolAcc.parentId)) : null;

        const counterpartiesList: any[] = [];
        if (acc.natureAdjustments) {
          for (const na of acc.natureAdjustments) {
            if (!na.moinCode) continue;
            const targetAcc = accounts.find(a => a.code === na.moinCode);
            counterpartiesList.push({
              id: targetAcc ? targetAcc.id : 0,
              code: na.moinCode,
              title: na.moinTitle || (targetAcc ? targetAcc.title : '')
            });
          }
        }

        const firstNatureAdjustment = counterpartiesList.length > 0 ? counterpartiesList[0] : null;
        const defaultCounterparty = firstNatureAdjustment ? firstNatureAdjustment.code : '';

        contraryLines.push({
          _id: `fy${fiscalYearId}-${idx}`,
          accountId: accId,
          moinCode: acc.code,
          moinTitle: acc.title,
          kolTitle: kolAcc ? kolAcc.title : '',
          groupTitle: groupAcc ? groupAcc.title : '',
          tafsilCode: da1 ? da1.code : '',
          tafsilTitle: da1 ? da1.title : '',
          level5: da2 ? da2.code : '',
          level5Title: da2 ? da2.title : '',
          level6: da3 ? da3.code : '',
          level6Title: da3 ? da3.title : '',
          detailedAccountId1: row.detailedAccountId1,
          detailedAccountId2: row.detailedAccountId2,
          detailedAccountId3: row.detailedAccountId3,
          currencyId: row.currencyId,
          currencyTitle: row.currencyId ? (currencyMap.get(Number(row.currencyId)) || '') : '',
          accountNature: accountNatureStr,
          balance: Math.abs(balance),
          balanceNature: balanceNature,
          counterpartyAccount: defaultCounterparty,
          counterpartyAccountObj: firstNatureAdjustment,
          allowedCounterparties: counterpartiesList
        });
      }
    });

    return contraryLines;
  }

  async saveAdjustmentVoucher(payload: any) {
    const { fiscalYearId, voucherDate, lines } = payload;
    
    // We will construct a new voucher
    if (!lines || lines.length === 0) {
      throw new BadRequestException('No adjustment lines provided');
    }

    const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;

    const whereScope = await this.getScopeWhere(bsId, compId);

    // Resolve counterparty accounts
    const accounts = await this.accountRepository.find({
      where: whereScope
    });
    
    const accountCodeMap = new Map<string, Account>();
    accounts.forEach(a => accountCodeMap.set(a.code, a));

    const voucherItems: any[] = [];
    
    let index = 1;
    for (const line of lines) {
      if (!line.counterpartyAccount || line.counterpartyAccount.trim() === '') {
        throw new BadRequestException(`ردیف ${index}: حساب مقابل نامشخص است`);
      }
      const cAccount = accountCodeMap.get(line.counterpartyAccount);
      if (!cAccount) {
        throw new BadRequestException(`کد حساب مقابل نامعتبر است: ${line.counterpartyAccount}`);
      }

      const bal = Number(line.balance);
      const isCreditBalance = line.balanceNature === 'بستانکار';

      // Original account line (to zero out)
      voucherItems.push({
        rowNumber: index++,
        accountId: line.accountId,
        detailedAccountId1: line.detailedAccountId1,
        detailedAccountId2: line.detailedAccountId2,
        detailedAccountId3: line.detailedAccountId3,
        currencyId: line.currencyId,
        debit: isCreditBalance ? bal : 0,
        credit: !isCreditBalance ? bal : 0,
        description: 'تعدیل ماهیت پایان دوره',
      });

      // Counterparty line
      voucherItems.push({
        rowNumber: index++,
        accountId: cAccount.id,
        // Carry over details? Usually adjustments might not carry all details, 
        // but for safety we can just use the moin level unless specified.
        detailedAccountId1: null,
        detailedAccountId2: null,
        detailedAccountId3: null,
        currencyId: line.currencyId,
        debit: !isCreditBalance ? bal : 0,
        credit: isCreditBalance ? bal : 0,
        description: 'بستن حساب خلاف ماهیت',
      });
    }

    // Prepare voucher payload
    const voucherDto: any = {
      voucherTypeId: 1, // Assuming 1 is adjustment or standard
      voucherNumber: 0,
      voucherDate: voucherDate || new Date().toISOString(),
      description: 'سند تعدیل ماهیت',
      items: voucherItems
    };

    // Use existing voucher service to create the voucher
    return await this.voucherService.create(voucherDto);
  }
}
