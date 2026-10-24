"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RapModule = exports.IPettyCashRequestRepositoryToken = exports.IPettyCashSummaryRepositoryToken = exports.IPettyCashRepositoryToken = void 0;
const receipt_guarantee_entity_1 = require("./domain/entities/receipt-guarantee.entity");
const payment_guarantee_entity_1 = require("./domain/entities/payment-guarantee.entity");
const auto_voucher_service_1 = require("./application/services/auto-voucher.service");
const document_accounting_info_service_1 = require("./application/services/document-accounting-info.service");
const document_accounting_info_controller_1 = require("./presentation/controllers/document-accounting-info.controller");
const document_accounting_info_entity_1 = require("./domain/entities/document-accounting-info.entity");
const rap_dynamic_detailed_controller_1 = require("./presentation/controllers/rap-dynamic-detailed.controller");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const voucher_item_entity_1 = require("../accounting/domain/entities/voucher-item.entity");
const account_entity_1 = require("../accounting/domain/entities/account.entity");
const cash_entity_1 = require("./domain/entities/cash.entity");
const cashier_entity_1 = require("./domain/entities/cashier.entity");
const bank_account_type_entity_1 = require("./domain/entities/bank-account-type.entity");
const bank_entity_1 = require("./domain/entities/bank.entity");
const bank_branch_entity_1 = require("./domain/entities/bank-branch.entity");
const bank_account_entity_1 = require("./domain/entities/bank-account.entity");
const chequebook_entity_1 = require("./domain/entities/chequebook.entity");
const chequebook_item_entity_1 = require("./domain/entities/chequebook-item.entity");
const promissory_note_entity_1 = require("./domain/entities/promissory-note.entity");
const promissory_note_item_entity_1 = require("./domain/entities/promissory-note-item.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("./domain/entities/reciept-and-payment-accounting-setting.entity");
const payment_gateway_entity_1 = require("./domain/entities/payment-gateway.entity");
const payment_gateway_contact_entity_1 = require("./domain/entities/payment-gateway-contact.entity");
const cheque_print_template_entity_1 = require("./domain/entities/cheque-print-template.entity");
const rap_reason_entity_1 = require("./domain/entities/rap-reason.entity");
const payment_notification_entity_1 = require("./domain/entities/payment-notification.entity");
const payment_cash_entity_1 = require("./domain/entities/payment-cash.entity");
const payment_cheque_entity_1 = require("./domain/entities/payment-cheque.entity");
const payment_withdrawal_entity_1 = require("./domain/entities/payment-withdrawal.entity");
const receipt_notification_entity_1 = require("./domain/entities/receipt-notification.entity");
const receipt_cash_entity_1 = require("./domain/entities/receipt-cash.entity");
const receipt_cheque_entity_1 = require("./domain/entities/receipt-cheque.entity");
const receipt_deposit_entity_1 = require("./domain/entities/receipt-deposit.entity");
const receipt_returned_paid_cheque_entity_1 = require("./domain/entities/receipt-returned-paid-cheque.entity");
const receipt_promissory_note_entity_1 = require("./domain/entities/receipt-promissory-note.entity");
const receipt_returned_payment_assignment_entity_1 = require("./domain/entities/receipt-returned-payment-assignment.entity");
const receipt_returned_payment_promissory_note_entity_1 = require("./domain/entities/receipt-returned-payment-promissory-note.entity");
const payment_assignment_entity_1 = require("./domain/entities/payment-assignment.entity");
const payment_promissory_note_entity_1 = require("./domain/entities/payment-promissory-note.entity");
const payment_returned_received_cheque_entity_1 = require("./domain/entities/payment-returned-received-cheque.entity");
const payment_returned_received_promissory_note_entity_1 = require("./domain/entities/payment-returned-received-promissory-note.entity");
const received_cheque_operation_entity_1 = require("./domain/entities/received-cheque-operation.entity");
const received_cheque_operation_item_entity_1 = require("./domain/entities/received-cheque-operation-item.entity");
const paid_document_clearing_entity_1 = require("./domain/entities/paid-document-clearing.entity");
const paid_document_clearing_item_entity_1 = require("./domain/entities/paid-document-clearing-item.entity");
const reconcile_bank_statement_entity_1 = require("./domain/entities/reconcile-bank-statement.entity");
const reconcile_bank_statement_item_entity_1 = require("./domain/entities/reconcile-bank-statement-item.entity");
const bank_reconciliation_entity_1 = require("./domain/entities/bank-reconciliation.entity");
const bank_reconciliation_item_entity_1 = require("./domain/entities/bank-reconciliation-item.entity");
const petty_cash_entity_1 = require("./domain/entities/petty-cash.entity");
const petty_cash_summary_entity_1 = require("./domain/entities/petty-cash-summary.entity");
const petty_cash_summary_item_entity_1 = require("./domain/entities/petty-cash-summary-item.entity");
const petty_cash_request_entity_1 = require("./domain/entities/petty-cash-request.entity");
const cash_repository_interface_1 = require("./domain/repositories/cash.repository.interface");
const cashier_repository_interface_1 = require("./domain/repositories/cashier.repository.interface");
const bank_account_type_repository_interface_1 = require("./domain/repositories/bank-account-type.repository.interface");
const bank_repository_interface_1 = require("./domain/repositories/bank.repository.interface");
const bank_branch_repository_interface_1 = require("./domain/repositories/bank-branch.repository.interface");
const bank_account_repository_interface_1 = require("./domain/repositories/bank-account.repository.interface");
const chequebook_repository_interface_1 = require("./domain/repositories/chequebook.repository.interface");
const promissory_note_repository_interface_1 = require("./domain/repositories/promissory-note.repository.interface");
const reciept_and_payment_accounting_setting_repository_interface_1 = require("./domain/repositories/reciept-and-payment-accounting-setting.repository.interface");
const payment_gateway_repository_interface_1 = require("./domain/repositories/payment-gateway.repository.interface");
const cheque_print_template_repository_interface_1 = require("./domain/repositories/cheque-print-template.repository.interface");
const rap_reason_repository_interface_1 = require("./domain/repositories/rap-reason.repository.interface");
const payment_notification_repository_interface_1 = require("./domain/repositories/payment-notification.repository.interface");
const receipt_notification_repository_interface_1 = require("./domain/repositories/receipt-notification.repository.interface");
const received_cheque_operation_repository_interface_1 = require("./domain/repositories/received-cheque-operation.repository.interface");
const paid_document_clearing_repository_interface_1 = require("./domain/repositories/paid-document-clearing.repository.interface");
const reconcile_bank_statement_repository_interface_1 = require("./domain/repositories/reconcile-bank-statement.repository.interface");
const bank_reconciliation_repository_interface_1 = require("./domain/repositories/bank-reconciliation.repository.interface");
exports.IPettyCashRepositoryToken = 'IPettyCashRepository';
exports.IPettyCashSummaryRepositoryToken = 'IPettyCashSummaryRepository';
exports.IPettyCashRequestRepositoryToken = 'IPettyCashRequestRepository';
const cash_repository_1 = require("./infrastructure/repositories/cash.repository");
const cashier_repository_1 = require("./infrastructure/repositories/cashier.repository");
const bank_account_type_repository_1 = require("./infrastructure/repositories/bank-account-type.repository");
const bank_repository_1 = require("./infrastructure/repositories/bank.repository");
const bank_branch_repository_1 = require("./infrastructure/repositories/bank-branch.repository");
const bank_account_repository_1 = require("./infrastructure/repositories/bank-account.repository");
const chequebook_repository_1 = require("./infrastructure/repositories/chequebook.repository");
const promissory_note_repository_1 = require("./infrastructure/repositories/promissory-note.repository");
const reciept_and_payment_accounting_setting_repository_1 = require("./infrastructure/repositories/reciept-and-payment-accounting-setting.repository");
const payment_gateway_repository_1 = require("./infrastructure/repositories/payment-gateway.repository");
const cheque_print_template_repository_1 = require("./infrastructure/repositories/cheque-print-template.repository");
const rap_reason_repository_1 = require("./infrastructure/repositories/rap-reason.repository");
const payment_notification_repository_1 = require("./infrastructure/repositories/payment-notification.repository");
const receipt_notification_repository_1 = require("./infrastructure/repositories/receipt-notification.repository");
const received_cheque_operation_repository_1 = require("./infrastructure/repositories/received-cheque-operation.repository");
const paid_document_clearing_repository_1 = require("./infrastructure/repositories/paid-document-clearing.repository");
const reconcile_bank_statement_repository_1 = require("./infrastructure/repositories/reconcile-bank-statement.repository");
const bank_reconciliation_repository_1 = require("./infrastructure/repositories/bank-reconciliation.repository");
const petty_cash_repository_1 = require("./infrastructure/repositories/petty-cash.repository");
const petty_cash_summary_repository_1 = require("./infrastructure/repositories/petty-cash-summary.repository");
const petty_cash_request_repository_1 = require("./infrastructure/repositories/petty-cash-request.repository");
const cash_service_1 = require("./application/services/cash.service");
const bank_account_type_service_1 = require("./application/services/bank-account-type.service");
const bank_service_1 = require("./application/services/bank.service");
const bank_branch_service_1 = require("./application/services/bank-branch.service");
const bank_account_service_1 = require("./application/services/bank-account.service");
const chequebook_service_1 = require("./application/services/chequebook.service");
const promissory_note_service_1 = require("./application/services/promissory-note.service");
const reciept_and_payment_accounting_setting_service_1 = require("./application/services/reciept-and-payment-accounting-setting.service");
const payment_gateway_service_1 = require("./application/services/payment-gateway.service");
const cheque_print_template_service_1 = require("./application/services/cheque-print-template.service");
const rap_reason_service_1 = require("./application/services/rap-reason.service");
const payment_notification_service_1 = require("./application/services/payment-notification.service");
const receipt_notification_service_1 = require("./application/services/receipt-notification.service");
const received_cheque_operation_service_1 = require("./application/services/received-cheque-operation.service");
const paid_document_clearing_service_1 = require("./application/services/paid-document-clearing.service");
const reconcile_bank_statement_service_1 = require("./application/services/reconcile-bank-statement.service");
const bank_reconciliation_service_1 = require("./application/services/bank-reconciliation.service");
const petty_cash_service_1 = require("./application/services/petty-cash.service");
const petty_cash_summary_service_1 = require("./application/services/petty-cash-summary.service");
const petty_cash_request_service_1 = require("./application/services/petty-cash-request.service");
const cash_controller_1 = require("./presentation/controllers/cash.controller");
const bank_account_type_controller_1 = require("./presentation/controllers/bank-account-type.controller");
const bank_controller_1 = require("./presentation/controllers/bank.controller");
const bank_branch_controller_1 = require("./presentation/controllers/bank-branch.controller");
const bank_account_controller_1 = require("./presentation/controllers/bank-account.controller");
const chequebook_controller_1 = require("./presentation/controllers/chequebook.controller");
const promissory_note_controller_1 = require("./presentation/controllers/promissory-note.controller");
const reciept_and_payment_accounting_setting_controller_1 = require("./presentation/controllers/reciept-and-payment-accounting-setting.controller");
const payment_gateway_controller_1 = require("./presentation/controllers/payment-gateway.controller");
const cheque_print_template_controller_1 = require("./presentation/controllers/cheque-print-template.controller");
const rap_reason_controller_1 = require("./presentation/controllers/rap-reason.controller");
const payment_notification_controller_1 = require("./presentation/controllers/payment-notification.controller");
const receipt_notification_controller_1 = require("./presentation/controllers/receipt-notification.controller");
const received_cheque_operation_controller_1 = require("./presentation/controllers/received-cheque-operation.controller");
const paid_document_clearing_controller_1 = require("./presentation/controllers/paid-document-clearing.controller");
const reconcile_bank_statement_controller_1 = require("./presentation/controllers/reconcile-bank-statement.controller");
const bank_reconciliation_controller_1 = require("./presentation/controllers/bank-reconciliation.controller");
const petty_cash_controller_1 = require("./presentation/controllers/petty-cash.controller");
const petty_cash_summary_controller_1 = require("./presentation/controllers/petty-cash-summary.controller");
const petty_cash_request_controller_1 = require("./presentation/controllers/petty-cash-request.controller");
const rap_review_controller_1 = require("./presentation/controllers/rap-review.controller");
const core_module_1 = require("../../core/core.module");
const accounting_module_1 = require("../accounting/accounting.module");
const common_module_1 = require("../common/common.module");
let RapModule = class RapModule {
};
exports.RapModule = RapModule;
exports.RapModule = RapModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([account_entity_1.Account, cash_entity_1.Cash, cashier_entity_1.Cashier, bank_account_type_entity_1.BankAccountType, bank_entity_1.Bank, bank_branch_entity_1.BankBranch, bank_account_entity_1.BankAccount, chequebook_entity_1.Chequebook, chequebook_item_entity_1.ChequebookItem, promissory_note_entity_1.PromissoryNote, promissory_note_item_entity_1.PromissoryNoteItem, reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting, payment_gateway_entity_1.PaymentGateway, payment_gateway_contact_entity_1.PaymentGatewayContact, cheque_print_template_entity_1.ChequePrintTemplate, rap_reason_entity_1.RapReason, payment_notification_entity_1.PaymentNotification, payment_cash_entity_1.PaymentCash, payment_cheque_entity_1.PaymentCheque, payment_withdrawal_entity_1.PaymentWithdrawal, payment_assignment_entity_1.PaymentAssignment, payment_promissory_note_entity_1.PaymentPromissoryNote, payment_returned_received_cheque_entity_1.PaymentReturnedReceivedCheque, payment_returned_received_promissory_note_entity_1.PaymentReturnedReceivedPromissoryNote, receipt_notification_entity_1.ReceiptNotification, receipt_cash_entity_1.ReceiptCash, receipt_cheque_entity_1.ReceiptCheque, receipt_deposit_entity_1.ReceiptDeposit, receipt_returned_paid_cheque_entity_1.ReceiptReturnedPaidCheque, receipt_promissory_note_entity_1.ReceiptPromissoryNote, receipt_guarantee_entity_1.ReceiptGuarantee, payment_guarantee_entity_1.PaymentGuarantee, receipt_returned_payment_assignment_entity_1.ReceiptReturnedPaymentAssignment, receipt_returned_payment_promissory_note_entity_1.ReceiptReturnedPaymentPromissoryNote, received_cheque_operation_entity_1.ReceivedChequeOperation, received_cheque_operation_item_entity_1.ReceivedChequeOperationItem, paid_document_clearing_entity_1.PaidDocumentClearing, paid_document_clearing_item_entity_1.PaidDocumentClearingItem, reconcile_bank_statement_entity_1.ReconcileBankStatement, reconcile_bank_statement_item_entity_1.ReconcileBankStatementItem, bank_reconciliation_entity_1.BankReconciliation, bank_reconciliation_item_entity_1.BankReconciliationItem, petty_cash_entity_1.PettyCash, petty_cash_summary_entity_1.PettyCashSummary, petty_cash_summary_item_entity_1.PettyCashSummaryItem, petty_cash_request_entity_1.PettyCashRequest,
                document_accounting_info_entity_1.DocumentAccountingInfo, voucher_item_entity_1.VoucherItem]),
            core_module_1.CoreModule,
            accounting_module_1.AccountingModule,
            common_module_1.CommonModule,
        ],
        controllers: [
            document_accounting_info_controller_1.DocumentAccountingInfoController, cash_controller_1.CashController, bank_account_type_controller_1.BankAccountTypeController, bank_controller_1.BankController, bank_branch_controller_1.BankBranchController, bank_account_controller_1.BankAccountController, chequebook_controller_1.ChequebookController, promissory_note_controller_1.PromissoryNoteController, reciept_and_payment_accounting_setting_controller_1.RecieptAndPaymentAccountingSettingController, payment_gateway_controller_1.PaymentGatewayController, cheque_print_template_controller_1.ChequePrintTemplateController, rap_reason_controller_1.RapReasonController, payment_notification_controller_1.PaymentNotificationController, receipt_notification_controller_1.ReceiptNotificationController, received_cheque_operation_controller_1.ReceivedChequeOperationController, paid_document_clearing_controller_1.PaidDocumentClearingController, reconcile_bank_statement_controller_1.ReconcileBankStatementController, bank_reconciliation_controller_1.BankReconciliationController, petty_cash_controller_1.PettyCashController, petty_cash_summary_controller_1.PettyCashSummaryController, petty_cash_request_controller_1.PettyCashRequestController, rap_review_controller_1.RapReviewController, rap_dynamic_detailed_controller_1.RapDynamicDetailedController
        ],
        providers: [
            document_accounting_info_service_1.DocumentAccountingInfoService,
            auto_voucher_service_1.AutoVoucherService,
            { provide: cash_repository_interface_1.ICashRepositoryToken, useClass: cash_repository_1.CashRepository },
            { provide: cashier_repository_interface_1.ICashierRepositoryToken, useClass: cashier_repository_1.CashierRepository },
            { provide: bank_account_type_repository_interface_1.IBankAccountTypeRepositoryToken, useClass: bank_account_type_repository_1.BankAccountTypeRepository },
            { provide: bank_repository_interface_1.IBankRepositoryToken, useClass: bank_repository_1.BankRepository },
            { provide: bank_branch_repository_interface_1.IBankBranchRepositoryToken, useClass: bank_branch_repository_1.BankBranchRepository },
            { provide: bank_account_repository_interface_1.IBankAccountRepositoryToken, useClass: bank_account_repository_1.BankAccountRepository },
            { provide: chequebook_repository_interface_1.IChequebookRepositoryToken, useClass: chequebook_repository_1.ChequebookRepository },
            { provide: promissory_note_repository_interface_1.IPromissoryNoteRepositoryToken, useClass: promissory_note_repository_1.PromissoryNoteRepository },
            { provide: reciept_and_payment_accounting_setting_repository_interface_1.IRecieptAndPaymentAccountingSettingRepositoryToken, useClass: reciept_and_payment_accounting_setting_repository_1.RecieptAndPaymentAccountingSettingRepository },
            { provide: payment_gateway_repository_interface_1.IPaymentGatewayRepositoryToken, useClass: payment_gateway_repository_1.PaymentGatewayRepository },
            { provide: cheque_print_template_repository_interface_1.IChequePrintTemplateRepositoryToken, useClass: cheque_print_template_repository_1.ChequePrintTemplateRepository },
            { provide: rap_reason_repository_interface_1.IRapReasonRepositoryToken, useClass: rap_reason_repository_1.RapReasonRepository },
            { provide: payment_notification_repository_interface_1.IPaymentNotificationRepositoryToken, useClass: payment_notification_repository_1.PaymentNotificationRepository },
            { provide: receipt_notification_repository_interface_1.IReceiptNotificationRepositoryToken, useClass: receipt_notification_repository_1.ReceiptNotificationRepository },
            { provide: received_cheque_operation_repository_interface_1.IReceivedChequeOperationRepositoryToken, useClass: received_cheque_operation_repository_1.ReceivedChequeOperationRepository },
            { provide: paid_document_clearing_repository_interface_1.IPaidDocumentClearingRepositoryToken, useClass: paid_document_clearing_repository_1.PaidDocumentClearingRepository },
            { provide: reconcile_bank_statement_repository_interface_1.IReconcileBankStatementRepositoryToken, useClass: reconcile_bank_statement_repository_1.ReconcileBankStatementRepository },
            { provide: bank_reconciliation_repository_interface_1.IBankReconciliationRepositoryToken, useClass: bank_reconciliation_repository_1.BankReconciliationRepository },
            { provide: exports.IPettyCashRepositoryToken, useClass: petty_cash_repository_1.PettyCashRepository },
            { provide: exports.IPettyCashSummaryRepositoryToken, useClass: petty_cash_summary_repository_1.PettyCashSummaryRepository },
            { provide: exports.IPettyCashRequestRepositoryToken, useClass: petty_cash_request_repository_1.PettyCashRequestRepository },
            cash_service_1.CashService,
            bank_account_type_service_1.BankAccountTypeService,
            bank_service_1.BankService,
            bank_branch_service_1.BankBranchService,
            bank_account_service_1.BankAccountService,
            chequebook_service_1.ChequebookService,
            promissory_note_service_1.PromissoryNoteService,
            reciept_and_payment_accounting_setting_service_1.RecieptAndPaymentAccountingSettingService,
            payment_gateway_service_1.PaymentGatewayService,
            cheque_print_template_service_1.ChequePrintTemplateService,
            rap_reason_service_1.RapReasonService,
            payment_notification_service_1.PaymentNotificationService,
            receipt_notification_service_1.ReceiptNotificationService,
            received_cheque_operation_service_1.ReceivedChequeOperationService,
            paid_document_clearing_service_1.PaidDocumentClearingService,
            reconcile_bank_statement_service_1.ReconcileBankStatementService,
            bank_reconciliation_service_1.BankReconciliationService,
            petty_cash_service_1.PettyCashService,
            petty_cash_summary_service_1.PettyCashSummaryService,
            petty_cash_request_service_1.PettyCashRequestService,
        ],
        exports: [cash_service_1.CashService, bank_account_type_service_1.BankAccountTypeService, bank_service_1.BankService, bank_branch_service_1.BankBranchService, bank_account_service_1.BankAccountService, chequebook_service_1.ChequebookService, promissory_note_service_1.PromissoryNoteService, reciept_and_payment_accounting_setting_service_1.RecieptAndPaymentAccountingSettingService, payment_gateway_service_1.PaymentGatewayService, cheque_print_template_service_1.ChequePrintTemplateService, rap_reason_service_1.RapReasonService, payment_notification_service_1.PaymentNotificationService, receipt_notification_service_1.ReceiptNotificationService, received_cheque_operation_service_1.ReceivedChequeOperationService, paid_document_clearing_service_1.PaidDocumentClearingService, reconcile_bank_statement_service_1.ReconcileBankStatementService, bank_reconciliation_service_1.BankReconciliationService, petty_cash_service_1.PettyCashService, petty_cash_summary_service_1.PettyCashSummaryService, petty_cash_request_service_1.PettyCashRequestService],
    })
], RapModule);
//# sourceMappingURL=rap.module.js.map