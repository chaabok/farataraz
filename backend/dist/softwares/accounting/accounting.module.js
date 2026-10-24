"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const voucher_type_entity_1 = require("./domain/entities/voucher-type.entity");
const detailed_type_entity_1 = require("./domain/entities/detailed-type.entity");
const detailed_account_entity_1 = require("./domain/entities/detailed-account.entity");
const account_entity_1 = require("./domain/entities/account.entity");
const accounts_related_detailed_account_entity_1 = require("./domain/entities/accounts-related-detailed-account.entity");
const accounts_nature_adjusting_entity_1 = require("./domain/entities/accounts-nature-adjusting.entity");
const accounts_voucher_decriptions_entity_1 = require("./domain/entities/accounts-voucher-decriptions.entity");
const cost_center_entity_1 = require("./domain/entities/cost-center.entity");
const other_details_entity_1 = require("./domain/entities/other-details.entity");
const voucher_entity_1 = require("./domain/entities/voucher.entity");
const voucher_item_entity_1 = require("./domain/entities/voucher-item.entity");
const currency_entity_1 = require("../common/domain/entities/currency.entity");
const closing_temporary_account_entity_1 = require("./domain/entities/closing-temporary-account.entity");
const closing_temporary_account_item_entity_1 = require("./domain/entities/closing-temporary-account-item.entity");
const closing_temporary_account_selected_entity_1 = require("./domain/entities/closing-temporary-account-selected.entity");
const voucher_type_controller_1 = require("./presentation/controllers/voucher-type.controller");
const detailed_type_controller_1 = require("./presentation/controllers/detailed-type.controller");
const detailed_account_controller_1 = require("./presentation/controllers/detailed-account.controller");
const account_controller_1 = require("./presentation/controllers/account.controller");
const cost_center_controller_1 = require("./presentation/controllers/cost-center.controller");
const other_details_controller_1 = require("./presentation/controllers/other-details.controller");
const voucher_controller_1 = require("./presentation/controllers/voucher.controller");
const account_review_controller_1 = require("./presentation/controllers/account-review.controller");
const trial_balance_and_ledger_report_controller_1 = require("./presentation/controllers/trial-balance-and-ledger-report.controller");
const nature_adjustment_controller_1 = require("./presentation/controllers/nature-adjustment.controller");
const closing_temporary_account_controller_1 = require("./presentation/controllers/closing-temporary-account.controller");
const voucher_type_service_1 = require("./application/services/voucher-type.service");
const detailed_type_service_1 = require("./application/services/detailed-type.service");
const detailed_account_service_1 = require("./application/services/detailed-account.service");
const account_service_1 = require("./application/services/account.service");
const cost_center_service_1 = require("./application/services/cost-center.service");
const other_details_service_1 = require("./application/services/other-details.service");
const voucher_service_1 = require("./application/services/voucher.service");
const nature_adjustment_service_1 = require("./application/services/nature-adjustment.service");
const closing_temporary_account_service_1 = require("./application/services/closing-temporary-account.service");
const voucher_type_repository_1 = require("./infrastructure/repositories/voucher-type.repository");
const detailed_type_repository_1 = require("./infrastructure/repositories/detailed-type.repository");
const detailed_account_repository_1 = require("./infrastructure/repositories/detailed-account.repository");
const account_repository_1 = require("./infrastructure/repositories/account.repository");
const cost_center_repository_1 = require("./infrastructure/repositories/cost-center.repository");
const other_details_repository_1 = require("./infrastructure/repositories/other-details.repository");
const voucher_repository_1 = require("./infrastructure/repositories/voucher.repository");
const voucher_type_repository_interface_1 = require("./domain/repositories/voucher-type.repository.interface");
const detailed_type_repository_interface_1 = require("./domain/repositories/detailed-type.repository.interface");
const detailed_account_repository_interface_1 = require("./domain/repositories/detailed-account.repository.interface");
const account_repository_interface_1 = require("./domain/repositories/account.repository.interface");
const cost_center_repository_interface_1 = require("./domain/repositories/cost-center.repository.interface");
const other_details_repository_interface_1 = require("./domain/repositories/other-details.repository.interface");
const core_module_1 = require("../../core/core.module");
const common_module_1 = require("../common/common.module");
let AccountingModule = class AccountingModule {
    constructor(detailedTypeService, voucherTypeService, accountService) {
        this.detailedTypeService = detailedTypeService;
        this.voucherTypeService = voucherTypeService;
        this.accountService = accountService;
    }
    async onModuleInit() {
        if (process.env.SYNC_DB === 'true') {
            try {
                await this.detailedTypeService.seedData();
                await this.voucherTypeService.seedData();
                await this.accountService.seedData();
            }
            catch (e) {
                console.error('Failed to seed accounting module', e);
            }
        }
    }
};
exports.AccountingModule = AccountingModule;
exports.AccountingModule = AccountingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                voucher_type_entity_1.VoucherType, detailed_type_entity_1.DetailedType, detailed_account_entity_1.DetailedAccount, account_entity_1.Account, accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount,
                cost_center_entity_1.CostCenter, other_details_entity_1.OtherDetails, voucher_entity_1.Voucher, voucher_item_entity_1.VoucherItem, accounts_nature_adjusting_entity_1.AccountsNatureAdjusting,
                accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, currency_entity_1.Currency,
                closing_temporary_account_entity_1.ClosingTemporaryAccount, closing_temporary_account_item_entity_1.ClosingTemporaryAccountItem, closing_temporary_account_selected_entity_1.ClosingTemporaryAccountSelected
            ]),
            core_module_1.CoreModule,
            (0, common_1.forwardRef)(() => common_module_1.CommonModule)
        ],
        controllers: [
            voucher_type_controller_1.VoucherTypeController, detailed_type_controller_1.DetailedTypeController, detailed_account_controller_1.DetailedAccountController, account_controller_1.AccountController,
            cost_center_controller_1.CostCenterController, other_details_controller_1.OtherDetailsController, voucher_controller_1.VoucherController, account_review_controller_1.AccountReviewController,
            trial_balance_and_ledger_report_controller_1.TrialBalanceAndLedgerReportController, nature_adjustment_controller_1.NatureAdjustmentController, closing_temporary_account_controller_1.ClosingTemporaryAccountController
        ],
        providers: [
            voucher_type_service_1.VoucherTypeService,
            detailed_type_service_1.DetailedTypeService,
            detailed_account_service_1.DetailedAccountService,
            account_service_1.AccountService,
            cost_center_service_1.CostCenterService,
            other_details_service_1.OtherDetailsService,
            voucher_service_1.VoucherService,
            nature_adjustment_service_1.NatureAdjustmentService,
            closing_temporary_account_service_1.ClosingTemporaryAccountService,
            {
                provide: voucher_type_repository_interface_1.IVoucherTypeRepositoryToken,
                useClass: voucher_type_repository_1.VoucherTypeRepository,
            },
            {
                provide: detailed_type_repository_interface_1.IDetailedTypeRepositoryToken,
                useClass: detailed_type_repository_1.DetailedTypeRepository,
            },
            {
                provide: detailed_account_repository_interface_1.IDetailedAccountRepositoryToken,
                useClass: detailed_account_repository_1.DetailedAccountRepository,
            },
            {
                provide: account_repository_interface_1.IAccountRepositoryToken,
                useClass: account_repository_1.AccountRepository,
            },
            {
                provide: cost_center_repository_interface_1.ICostCenterRepositoryToken,
                useClass: cost_center_repository_1.CostCenterRepository,
            },
            {
                provide: other_details_repository_interface_1.IOtherDetailsRepositoryToken,
                useClass: other_details_repository_1.OtherDetailsRepository,
            },
            {
                provide: 'IVoucherRepository',
                useClass: voucher_repository_1.VoucherRepository,
            },
        ],
        exports: [voucher_type_service_1.VoucherTypeService, detailed_type_service_1.DetailedTypeService, detailed_account_service_1.DetailedAccountService, account_service_1.AccountService, cost_center_service_1.CostCenterService, other_details_service_1.OtherDetailsService, voucher_service_1.VoucherService, closing_temporary_account_service_1.ClosingTemporaryAccountService],
    }),
    __metadata("design:paramtypes", [detailed_type_service_1.DetailedTypeService,
        voucher_type_service_1.VoucherTypeService,
        account_service_1.AccountService])
], AccountingModule);
//# sourceMappingURL=accounting.module.js.map