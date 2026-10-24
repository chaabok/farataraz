import { Module, OnModuleInit, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherType } from './domain/entities/voucher-type.entity';
import { DetailedType } from './domain/entities/detailed-type.entity';
import { DetailedAccount } from './domain/entities/detailed-account.entity';
import { Account } from './domain/entities/account.entity';
import { AccountsRelatedDetailedAccount } from './domain/entities/accounts-related-detailed-account.entity';
import { AccountsNatureAdjusting } from './domain/entities/accounts-nature-adjusting.entity';
import { AccountsVoucherDecriptions } from './domain/entities/accounts-voucher-decriptions.entity';
import { CostCenter } from './domain/entities/cost-center.entity';
import { OtherDetails } from './domain/entities/other-details.entity';
import { Voucher } from './domain/entities/voucher.entity';
import { VoucherItem } from './domain/entities/voucher-item.entity';
import { Currency } from '../common/domain/entities/currency.entity';
import { ClosingTemporaryAccount } from './domain/entities/closing-temporary-account.entity';
import { ClosingTemporaryAccountItem } from './domain/entities/closing-temporary-account-item.entity';
import { ClosingTemporaryAccountSelected } from './domain/entities/closing-temporary-account-selected.entity';

import { VoucherTypeController } from './presentation/controllers/voucher-type.controller';
import { DetailedTypeController } from './presentation/controllers/detailed-type.controller';
import { DetailedAccountController } from './presentation/controllers/detailed-account.controller';
import { AccountController } from './presentation/controllers/account.controller';
import { CostCenterController } from './presentation/controllers/cost-center.controller';
import { OtherDetailsController } from './presentation/controllers/other-details.controller';
import { VoucherController } from './presentation/controllers/voucher.controller';
import { AccountReviewController } from './presentation/controllers/account-review.controller';
import { TrialBalanceAndLedgerReportController } from './presentation/controllers/trial-balance-and-ledger-report.controller';
import { NatureAdjustmentController } from './presentation/controllers/nature-adjustment.controller';
import { ClosingTemporaryAccountController } from './presentation/controllers/closing-temporary-account.controller';

import { VoucherTypeService } from './application/services/voucher-type.service';
import { DetailedTypeService } from './application/services/detailed-type.service';
import { DetailedAccountService } from './application/services/detailed-account.service';
import { AccountService } from './application/services/account.service';
import { CostCenterService } from './application/services/cost-center.service';
import { OtherDetailsService } from './application/services/other-details.service';
import { VoucherService } from './application/services/voucher.service';
import { NatureAdjustmentService } from './application/services/nature-adjustment.service';
import { ClosingTemporaryAccountService } from './application/services/closing-temporary-account.service';

import { VoucherTypeRepository } from './infrastructure/repositories/voucher-type.repository';
import { DetailedTypeRepository } from './infrastructure/repositories/detailed-type.repository';
import { DetailedAccountRepository } from './infrastructure/repositories/detailed-account.repository';
import { AccountRepository } from './infrastructure/repositories/account.repository';
import { CostCenterRepository } from './infrastructure/repositories/cost-center.repository';
import { OtherDetailsRepository } from './infrastructure/repositories/other-details.repository';
import { VoucherRepository } from './infrastructure/repositories/voucher.repository';

import { IVoucherTypeRepositoryToken } from './domain/repositories/voucher-type.repository.interface';
import { IDetailedTypeRepositoryToken } from './domain/repositories/detailed-type.repository.interface';
import { IDetailedAccountRepositoryToken } from './domain/repositories/detailed-account.repository.interface';
import { IAccountRepositoryToken } from './domain/repositories/account.repository.interface';
import { ICostCenterRepositoryToken } from './domain/repositories/cost-center.repository.interface';
import { IOtherDetailsRepositoryToken } from './domain/repositories/other-details.repository.interface';

import { CoreModule } from '../../core/core.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VoucherType, DetailedType, DetailedAccount, Account, AccountsRelatedDetailedAccount, 
      CostCenter, OtherDetails, Voucher, VoucherItem, AccountsNatureAdjusting, 
      AccountsVoucherDecriptions, Currency,
      ClosingTemporaryAccount, ClosingTemporaryAccountItem, ClosingTemporaryAccountSelected
    ]), 
    CoreModule,
    forwardRef(() => CommonModule)
  ],
  controllers: [
    VoucherTypeController, DetailedTypeController, DetailedAccountController, AccountController, 
    CostCenterController, OtherDetailsController, VoucherController, AccountReviewController, 
    TrialBalanceAndLedgerReportController, NatureAdjustmentController, ClosingTemporaryAccountController
  ],
  providers: [
    VoucherTypeService,
    DetailedTypeService,
    DetailedAccountService,
    AccountService,
    CostCenterService,
    OtherDetailsService,
    VoucherService,
    NatureAdjustmentService,
    ClosingTemporaryAccountService,
    {
      provide: IVoucherTypeRepositoryToken,
      useClass: VoucherTypeRepository,
    },
    {
      provide: IDetailedTypeRepositoryToken,
      useClass: DetailedTypeRepository,
    },
    {
      provide: IDetailedAccountRepositoryToken,
      useClass: DetailedAccountRepository,
    },
    {
      provide: IAccountRepositoryToken,
      useClass: AccountRepository,
    },
    {
      provide: ICostCenterRepositoryToken,
      useClass: CostCenterRepository,
    },
    {
      provide: IOtherDetailsRepositoryToken,
      useClass: OtherDetailsRepository,
    },
    {
      provide: 'IVoucherRepository',
      useClass: VoucherRepository,
    },
  ],
  exports: [VoucherTypeService, DetailedTypeService, DetailedAccountService, AccountService, CostCenterService, OtherDetailsService, VoucherService, ClosingTemporaryAccountService],
})
export class AccountingModule implements OnModuleInit {
  constructor(
    private readonly detailedTypeService: DetailedTypeService,
    private readonly voucherTypeService: VoucherTypeService,
    private readonly accountService: AccountService,
  ) {}

  async onModuleInit() {
    if (process.env.SYNC_DB === 'true') {
      try {
        await this.detailedTypeService.seedData();
        await this.voucherTypeService.seedData();
        await this.accountService.seedData();
      } catch (e) {
        console.error('Failed to seed accounting module', e);
      }
    }
  }
}
