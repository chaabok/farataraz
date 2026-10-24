import { ReceiptGuarantee } from "./domain/entities/receipt-guarantee.entity";
import { PaymentGuarantee } from "./domain/entities/payment-guarantee.entity";
import { AutoVoucherService } from './application/services/auto-voucher.service';
import { DocumentAccountingInfoService } from './application/services/document-accounting-info.service';
import { DocumentAccountingInfoController } from './presentation/controllers/document-accounting-info.controller';
import { DocumentAccountingInfo } from './domain/entities/document-accounting-info.entity';
import { RapDynamicDetailedController } from "./presentation/controllers/rap-dynamic-detailed.controller";
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoucherItem } from '../accounting/domain/entities/voucher-item.entity';
import { Account } from '../accounting/domain/entities/account.entity';
import { Cash } from './domain/entities/cash.entity';
import { Cashier } from './domain/entities/cashier.entity';
import { BankAccountType } from './domain/entities/bank-account-type.entity';
import { Bank } from './domain/entities/bank.entity';
import { BankBranch } from './domain/entities/bank-branch.entity';
import { BankAccount } from './domain/entities/bank-account.entity';
import { Chequebook } from './domain/entities/chequebook.entity';
import { ChequebookItem } from './domain/entities/chequebook-item.entity';
import { PromissoryNote } from './domain/entities/promissory-note.entity';
import { PromissoryNoteItem } from './domain/entities/promissory-note-item.entity';
import { RecieptAndPaymentAccountingSetting } from './domain/entities/reciept-and-payment-accounting-setting.entity';
import { PaymentGateway } from './domain/entities/payment-gateway.entity';
import { PaymentGatewayContact } from './domain/entities/payment-gateway-contact.entity';
import { ChequePrintTemplate } from './domain/entities/cheque-print-template.entity';
import { RapReason } from './domain/entities/rap-reason.entity';
import { PaymentNotification } from './domain/entities/payment-notification.entity';
import { PaymentCash } from './domain/entities/payment-cash.entity';
import { PaymentCheque } from './domain/entities/payment-cheque.entity';
import { PaymentWithdrawal } from './domain/entities/payment-withdrawal.entity';
import { ReceiptNotification } from './domain/entities/receipt-notification.entity';
import { ReceiptCash } from './domain/entities/receipt-cash.entity';
import { ReceiptCheque } from './domain/entities/receipt-cheque.entity';
import { ReceiptDeposit } from './domain/entities/receipt-deposit.entity';
import { ReceiptReturnedPaidCheque } from './domain/entities/receipt-returned-paid-cheque.entity';
import { ReceiptPromissoryNote } from './domain/entities/receipt-promissory-note.entity';
import { ReceiptReturnedPaymentAssignment } from './domain/entities/receipt-returned-payment-assignment.entity';
import { ReceiptReturnedPaymentPromissoryNote } from './domain/entities/receipt-returned-payment-promissory-note.entity';
import { PaymentAssignment } from './domain/entities/payment-assignment.entity';
import { PaymentPromissoryNote } from './domain/entities/payment-promissory-note.entity';
import { PaymentReturnedReceivedCheque } from './domain/entities/payment-returned-received-cheque.entity';
import { PaymentReturnedReceivedPromissoryNote } from './domain/entities/payment-returned-received-promissory-note.entity';
import { ReceivedChequeOperation } from './domain/entities/received-cheque-operation.entity';
import { ReceivedChequeOperationItem } from './domain/entities/received-cheque-operation-item.entity';
import { PaidDocumentClearing } from './domain/entities/paid-document-clearing.entity';
import { PaidDocumentClearingItem } from './domain/entities/paid-document-clearing-item.entity';
import { ReconcileBankStatement } from './domain/entities/reconcile-bank-statement.entity';
import { ReconcileBankStatementItem } from './domain/entities/reconcile-bank-statement-item.entity';
import { BankReconciliation } from './domain/entities/bank-reconciliation.entity';
import { BankReconciliationItem } from './domain/entities/bank-reconciliation-item.entity';
import { PettyCash } from './domain/entities/petty-cash.entity';
import { PettyCashSummary } from './domain/entities/petty-cash-summary.entity';
import { PettyCashSummaryItem } from './domain/entities/petty-cash-summary-item.entity';
import { PettyCashRequest } from './domain/entities/petty-cash-request.entity';
import { ICashRepositoryToken } from './domain/repositories/cash.repository.interface';
import { ICashierRepositoryToken } from './domain/repositories/cashier.repository.interface';
import { IBankAccountTypeRepositoryToken } from './domain/repositories/bank-account-type.repository.interface';
import { IBankRepositoryToken } from './domain/repositories/bank.repository.interface';
import { IBankBranchRepositoryToken } from './domain/repositories/bank-branch.repository.interface';
import { IBankAccountRepositoryToken } from './domain/repositories/bank-account.repository.interface';
import { IChequebookRepositoryToken } from './domain/repositories/chequebook.repository.interface';
import { IPromissoryNoteRepositoryToken } from './domain/repositories/promissory-note.repository.interface';
import { IRecieptAndPaymentAccountingSettingRepositoryToken } from './domain/repositories/reciept-and-payment-accounting-setting.repository.interface';
import { IPaymentGatewayRepositoryToken } from './domain/repositories/payment-gateway.repository.interface';
import { IChequePrintTemplateRepositoryToken } from './domain/repositories/cheque-print-template.repository.interface';
import { IRapReasonRepositoryToken } from './domain/repositories/rap-reason.repository.interface';
import { IPaymentNotificationRepositoryToken } from './domain/repositories/payment-notification.repository.interface';
import { IReceiptNotificationRepositoryToken } from './domain/repositories/receipt-notification.repository.interface';
import { IReceivedChequeOperationRepositoryToken } from './domain/repositories/received-cheque-operation.repository.interface';
import { IPaidDocumentClearingRepositoryToken } from './domain/repositories/paid-document-clearing.repository.interface';
import { IReconcileBankStatementRepositoryToken } from './domain/repositories/reconcile-bank-statement.repository.interface';
import { IBankReconciliationRepositoryToken } from './domain/repositories/bank-reconciliation.repository.interface';
export const IPettyCashRepositoryToken = 'IPettyCashRepository';
export const IPettyCashSummaryRepositoryToken = 'IPettyCashSummaryRepository';
export const IPettyCashRequestRepositoryToken = 'IPettyCashRequestRepository';
import { CashRepository } from './infrastructure/repositories/cash.repository';
import { CashierRepository } from './infrastructure/repositories/cashier.repository';
import { BankAccountTypeRepository } from './infrastructure/repositories/bank-account-type.repository';
import { BankRepository } from './infrastructure/repositories/bank.repository';
import { BankBranchRepository } from './infrastructure/repositories/bank-branch.repository';
import { BankAccountRepository } from './infrastructure/repositories/bank-account.repository';
import { ChequebookRepository } from './infrastructure/repositories/chequebook.repository';
import { PromissoryNoteRepository } from './infrastructure/repositories/promissory-note.repository';
import { RecieptAndPaymentAccountingSettingRepository } from './infrastructure/repositories/reciept-and-payment-accounting-setting.repository';
import { PaymentGatewayRepository } from './infrastructure/repositories/payment-gateway.repository';
import { ChequePrintTemplateRepository } from './infrastructure/repositories/cheque-print-template.repository';
import { RapReasonRepository } from './infrastructure/repositories/rap-reason.repository';
import { PaymentNotificationRepository } from './infrastructure/repositories/payment-notification.repository';
import { ReceiptNotificationRepository } from './infrastructure/repositories/receipt-notification.repository';
import { ReceivedChequeOperationRepository } from './infrastructure/repositories/received-cheque-operation.repository';
import { PaidDocumentClearingRepository } from './infrastructure/repositories/paid-document-clearing.repository';
import { ReconcileBankStatementRepository } from './infrastructure/repositories/reconcile-bank-statement.repository';
import { BankReconciliationRepository } from './infrastructure/repositories/bank-reconciliation.repository';
import { PettyCashRepository } from './infrastructure/repositories/petty-cash.repository';
import { PettyCashSummaryRepository } from './infrastructure/repositories/petty-cash-summary.repository';
import { PettyCashRequestRepository } from './infrastructure/repositories/petty-cash-request.repository';
import { CashService } from './application/services/cash.service';
import { BankAccountTypeService } from './application/services/bank-account-type.service';
import { BankService } from './application/services/bank.service';
import { BankBranchService } from './application/services/bank-branch.service';
import { BankAccountService } from './application/services/bank-account.service';
import { ChequebookService } from './application/services/chequebook.service';
import { PromissoryNoteService } from './application/services/promissory-note.service';
import { RecieptAndPaymentAccountingSettingService } from './application/services/reciept-and-payment-accounting-setting.service';
import { PaymentGatewayService } from './application/services/payment-gateway.service';
import { ChequePrintTemplateService } from './application/services/cheque-print-template.service';
import { RapReasonService } from './application/services/rap-reason.service';
import { PaymentNotificationService } from './application/services/payment-notification.service';
import { ReceiptNotificationService } from './application/services/receipt-notification.service';
import { ReceivedChequeOperationService } from './application/services/received-cheque-operation.service';
import { PaidDocumentClearingService } from './application/services/paid-document-clearing.service';
import { ReconcileBankStatementService } from './application/services/reconcile-bank-statement.service';
import { BankReconciliationService } from './application/services/bank-reconciliation.service';
import { PettyCashService } from './application/services/petty-cash.service';
import { PettyCashSummaryService } from './application/services/petty-cash-summary.service';
import { PettyCashRequestService } from './application/services/petty-cash-request.service';
import { CashController } from './presentation/controllers/cash.controller';
import { BankAccountTypeController } from './presentation/controllers/bank-account-type.controller';
import { BankController } from './presentation/controllers/bank.controller';
import { BankBranchController } from './presentation/controllers/bank-branch.controller';
import { BankAccountController } from './presentation/controllers/bank-account.controller';
import { ChequebookController } from './presentation/controllers/chequebook.controller';
import { PromissoryNoteController } from './presentation/controllers/promissory-note.controller';
import { RecieptAndPaymentAccountingSettingController } from './presentation/controllers/reciept-and-payment-accounting-setting.controller';
import { PaymentGatewayController } from './presentation/controllers/payment-gateway.controller';
import { ChequePrintTemplateController } from './presentation/controllers/cheque-print-template.controller';
import { RapReasonController } from './presentation/controllers/rap-reason.controller';
import { PaymentNotificationController } from './presentation/controllers/payment-notification.controller';
import { ReceiptNotificationController } from './presentation/controllers/receipt-notification.controller';
import { ReceivedChequeOperationController } from './presentation/controllers/received-cheque-operation.controller';
import { PaidDocumentClearingController } from './presentation/controllers/paid-document-clearing.controller';
import { ReconcileBankStatementController } from './presentation/controllers/reconcile-bank-statement.controller';
import { BankReconciliationController } from './presentation/controllers/bank-reconciliation.controller';
import { PettyCashController } from './presentation/controllers/petty-cash.controller';
import { PettyCashSummaryController } from './presentation/controllers/petty-cash-summary.controller';
import { PettyCashRequestController } from './presentation/controllers/petty-cash-request.controller';
import { RapReviewController } from './presentation/controllers/rap-review.controller';
import { CoreModule } from '../../core/core.module';
import { AccountingModule } from '../accounting/accounting.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Account, Cash, Cashier, BankAccountType, Bank, BankBranch, BankAccount, Chequebook, ChequebookItem, PromissoryNote, PromissoryNoteItem, RecieptAndPaymentAccountingSetting, PaymentGateway, PaymentGatewayContact, ChequePrintTemplate, RapReason, PaymentNotification, PaymentCash, PaymentCheque, PaymentWithdrawal, PaymentAssignment, PaymentPromissoryNote, PaymentReturnedReceivedCheque, PaymentReturnedReceivedPromissoryNote, ReceiptNotification, ReceiptCash, ReceiptCheque, ReceiptDeposit, ReceiptReturnedPaidCheque, ReceiptPromissoryNote, ReceiptGuarantee, PaymentGuarantee, ReceiptReturnedPaymentAssignment, ReceiptReturnedPaymentPromissoryNote, ReceivedChequeOperation, ReceivedChequeOperationItem, PaidDocumentClearing, PaidDocumentClearingItem, ReconcileBankStatement, ReconcileBankStatementItem, BankReconciliation, BankReconciliationItem, PettyCash, PettyCashSummary, PettyCashSummaryItem, PettyCashRequest,
      DocumentAccountingInfo, VoucherItem]),
    CoreModule,
    AccountingModule,
    CommonModule,
  ],
  controllers: [
    DocumentAccountingInfoController,CashController, BankAccountTypeController, BankController, BankBranchController, BankAccountController, ChequebookController, PromissoryNoteController, RecieptAndPaymentAccountingSettingController, PaymentGatewayController, ChequePrintTemplateController, RapReasonController, PaymentNotificationController, ReceiptNotificationController, ReceivedChequeOperationController, PaidDocumentClearingController, ReconcileBankStatementController, BankReconciliationController, PettyCashController, PettyCashSummaryController, PettyCashRequestController, RapReviewController, RapDynamicDetailedController],
  providers: [
    DocumentAccountingInfoService,
    AutoVoucherService,
    { provide: ICashRepositoryToken, useClass: CashRepository },
    { provide: ICashierRepositoryToken, useClass: CashierRepository },
    { provide: IBankAccountTypeRepositoryToken, useClass: BankAccountTypeRepository },
    { provide: IBankRepositoryToken, useClass: BankRepository },
    { provide: IBankBranchRepositoryToken, useClass: BankBranchRepository },
    { provide: IBankAccountRepositoryToken, useClass: BankAccountRepository },
    { provide: IChequebookRepositoryToken, useClass: ChequebookRepository },
    { provide: IPromissoryNoteRepositoryToken, useClass: PromissoryNoteRepository },
    { provide: IRecieptAndPaymentAccountingSettingRepositoryToken, useClass: RecieptAndPaymentAccountingSettingRepository },
    { provide: IPaymentGatewayRepositoryToken, useClass: PaymentGatewayRepository },
    { provide: IChequePrintTemplateRepositoryToken, useClass: ChequePrintTemplateRepository },
    { provide: IRapReasonRepositoryToken, useClass: RapReasonRepository },
    { provide: IPaymentNotificationRepositoryToken, useClass: PaymentNotificationRepository },
    { provide: IReceiptNotificationRepositoryToken, useClass: ReceiptNotificationRepository },
    { provide: IReceivedChequeOperationRepositoryToken, useClass: ReceivedChequeOperationRepository },
    { provide: IPaidDocumentClearingRepositoryToken, useClass: PaidDocumentClearingRepository },
    { provide: IReconcileBankStatementRepositoryToken, useClass: ReconcileBankStatementRepository },
    { provide: IBankReconciliationRepositoryToken, useClass: BankReconciliationRepository },
    { provide: IPettyCashRepositoryToken, useClass: PettyCashRepository },
    { provide: IPettyCashSummaryRepositoryToken, useClass: PettyCashSummaryRepository },
    { provide: IPettyCashRequestRepositoryToken, useClass: PettyCashRequestRepository },
    CashService,
    BankAccountTypeService,
    BankService,
    BankBranchService,
    BankAccountService,
    ChequebookService,
    PromissoryNoteService,
    RecieptAndPaymentAccountingSettingService,
    PaymentGatewayService,
    ChequePrintTemplateService,
    RapReasonService,
    PaymentNotificationService,
    ReceiptNotificationService,
    ReceivedChequeOperationService,
    PaidDocumentClearingService,
    ReconcileBankStatementService,
    BankReconciliationService,
    PettyCashService,
    PettyCashSummaryService,
    PettyCashRequestService,
  ],
  exports: [CashService, BankAccountTypeService, BankService, BankBranchService, BankAccountService, ChequebookService, PromissoryNoteService, RecieptAndPaymentAccountingSettingService, PaymentGatewayService, ChequePrintTemplateService, RapReasonService, PaymentNotificationService, ReceiptNotificationService, ReceivedChequeOperationService, PaidDocumentClearingService, ReconcileBankStatementService, BankReconciliationService, PettyCashService, PettyCashSummaryService, PettyCashRequestService],
})
export class RapModule {}




