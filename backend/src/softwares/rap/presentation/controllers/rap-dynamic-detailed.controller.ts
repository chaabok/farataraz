import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RapReason } from '../../domain/entities/rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';

@Controller('rap/dynamic-detailed-types')
export class RapDynamicDetailedController {
  constructor(
    @InjectRepository(RapReason)
    private readonly reasonRepository: Repository<RapReason>,
    @InjectRepository(RecieptAndPaymentAccountingSetting)
    private readonly settingRepository: Repository<RecieptAndPaymentAccountingSetting>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  @Get()
  async getRequiredDetailedTypes(
    @Query('reasonId') reasonId?: string,
    @Query('accountingSettingId') accountingSettingId?: string,
  ) {
    try {
      let accountRef: number | null = null;

      if (accountingSettingId) {
        const setting = await this.settingRepository.findOne({ where: { recieptAndPaymentAccountingSettingId: Number(accountingSettingId) } });
        if (setting && setting.accountRef) {
          accountRef = setting.accountRef;
        }
      } else if (reasonId) {
        const reason = await this.reasonRepository.findOne({ where: { RapReasonID: Number(reasonId) } });
        if (reason && reason.AccountRef) {
          accountRef = reason.AccountRef;
        }
      }

      if (!accountRef) {
        return { success: true, detailedTypes: [] };
      }

      const account = await this.accountRepository.findOne({
        where: { id: accountRef },
        relations: ['relatedDetailedAccounts', 'relatedDetailedAccounts.detailedType'],
      });

      if (!account || !account.relatedDetailedAccounts) {
        return { success: true, detailedTypes: [] };
      }

      const detailedTypes = account.relatedDetailedAccounts.map(rd => ({
        detailedLevel: rd.detailedLevel,
        detailedTypeId: rd.detailedType?.detailedTypesId,
        code: rd.detailedType?.code,
        title: rd.detailedType?.title,
      })).sort((a, b) => a.detailedLevel - b.detailedLevel);

      return { success: true, detailedTypes };
    } catch (error) {
      throw new HttpException(error.message || 'Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
