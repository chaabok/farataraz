"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_group_entity_1 = require("./domain/entities/customer-group.entity");
const customer_group_controller_1 = require("./presentation/controllers/customer-group.controller");
const customer_group_service_1 = require("./application/services/customer-group.service");
const customer_group_repository_1 = require("./infrastructure/repositories/customer-group.repository");
const customer_group_repository_interface_1 = require("./domain/repositories/customer-group.repository.interface");
const wallet_entity_1 = require("./domain/entities/wallet.entity");
const wallet_controller_1 = require("./presentation/controllers/wallet.controller");
const wallet_service_1 = require("./application/services/wallet.service");
const wallet_repository_1 = require("./infrastructure/repositories/wallet.repository");
const wallet_repository_interface_1 = require("./domain/repositories/wallet.repository.interface");
const sales_channel_entity_1 = require("./domain/entities/sales-channel.entity");
const sales_channel_controller_1 = require("./presentation/controllers/sales-channel.controller");
const sales_channel_service_1 = require("./application/services/sales-channel.service");
const sales_channel_repository_1 = require("./infrastructure/repositories/sales-channel.repository");
const sales_channel_repository_interface_1 = require("./domain/repositories/sales-channel.repository.interface");
const sales_type_entity_1 = require("./domain/entities/sales-type.entity");
const sales_type_controller_1 = require("./presentation/controllers/sales-type.controller");
const sales_type_service_1 = require("./application/services/sales-type.service");
const sales_type_repository_1 = require("./infrastructure/repositories/sales-type.repository");
const sales_type_repository_interface_1 = require("./domain/repositories/sales-type.repository.interface");
const delivery_location_entity_1 = require("./domain/entities/delivery-location.entity");
const delivery_location_controller_1 = require("./presentation/controllers/delivery-location.controller");
const delivery_location_service_1 = require("./application/services/delivery-location.service");
const delivery_location_repository_1 = require("./infrastructure/repositories/delivery-location.repository");
const delivery_location_repository_interface_1 = require("./domain/repositories/delivery-location.repository.interface");
const sales_center_entity_1 = require("./domain/entities/sales-center.entity");
const sales_center_controller_1 = require("./presentation/controllers/sales-center.controller");
const sales_center_service_1 = require("./application/services/sales-center.service");
const sales_center_repository_1 = require("./infrastructure/repositories/sales-center.repository");
const sales_center_repository_interface_1 = require("./domain/repositories/sales-center.repository.interface");
const customer_entity_1 = require("./domain/entities/customer.entity");
const customer_controller_1 = require("./presentation/controllers/customer.controller");
const customer_service_1 = require("./application/services/customer.service");
const customer_repository_1 = require("./infrastructure/repositories/customer.repository");
const customer_repository_interface_1 = require("./domain/repositories/customer.repository.interface");
const sales_account_category_entity_1 = require("./domain/entities/sales-account-category.entity");
const sales_account_category_controller_1 = require("./presentation/controllers/sales-account-category.controller");
const sales_account_category_service_1 = require("./application/services/sales-account-category.service");
const sales_account_category_repository_1 = require("./infrastructure/repositories/sales-account-category.repository");
const sales_account_category_repository_interface_1 = require("./domain/repositories/sales-account-category.repository.interface");
const sales_item_group_entity_1 = require("./domain/entities/sales-item-group.entity");
const sales_item_group_related_product_entity_1 = require("./domain/entities/sales-item-group-related-product.entity");
const sales_item_group_controller_1 = require("./presentation/controllers/sales-item-group.controller");
const sales_item_group_service_1 = require("./application/services/sales-item-group.service");
const sales_item_group_repository_1 = require("./infrastructure/repositories/sales-item-group.repository");
const sales_item_group_repository_interface_1 = require("./domain/repositories/sales-item-group.repository.interface");
const sales_document_settings_entity_1 = require("./domain/entities/sales-document-settings.entity");
const sales_document_settings_controller_1 = require("./presentation/controllers/sales-document-settings.controller");
const sales_document_settings_service_1 = require("./application/services/sales-document-settings.service");
const sales_document_settings_repository_1 = require("./infrastructure/repositories/sales-document-settings.repository");
const sales_document_settings_repository_interface_1 = require("./domain/repositories/sales-document-settings.repository.interface");
const settlement_method_entity_1 = require("./domain/entities/settlement-method.entity");
const settlement_method_controller_1 = require("./presentation/controllers/settlement-method.controller");
const settlement_method_service_1 = require("./application/services/settlement-method.service");
const settlement_method_repository_1 = require("./infrastructure/repositories/settlement-method.repository");
const settlement_method_repository_interface_1 = require("./domain/repositories/settlement-method.repository.interface");
const sales_order_entity_1 = require("./domain/entities/sales-order.entity");
const sales_order_item_entity_1 = require("./domain/entities/sales-order-item.entity");
const sales_order_factor_entity_1 = require("./domain/entities/sales-order-factor.entity");
const sales_order_controller_1 = require("./presentation/controllers/sales-order.controller");
const sales_order_service_1 = require("./application/services/sales-order.service");
const sales_proforma_invoice_entity_1 = require("./domain/entities/sales-proforma-invoice.entity");
const sales_proforma_invoice_item_entity_1 = require("./domain/entities/sales-proforma-invoice-item.entity");
const sales_proforma_invoice_factor_entity_1 = require("./domain/entities/sales-proforma-invoice-factor.entity");
const sales_proforma_invoice_controller_1 = require("./presentation/controllers/sales-proforma-invoice.controller");
const sales_proforma_invoice_service_1 = require("./application/services/sales-proforma-invoice.service");
const sales_contract_entity_1 = require("./domain/entities/sales-contract.entity");
const sales_contract_item_entity_1 = require("./domain/entities/sales-contract-item.entity");
const sales_contract_factor_entity_1 = require("./domain/entities/sales-contract-factor.entity");
const sales_contract_controller_1 = require("./presentation/controllers/sales-contract.controller");
const sales_contract_service_1 = require("./application/services/sales-contract.service");
const sales_invoice_entity_1 = require("./domain/entities/sales-invoice.entity");
const sales_invoice_item_entity_1 = require("./domain/entities/sales-invoice-item.entity");
const sales_invoice_factor_entity_1 = require("./domain/entities/sales-invoice-factor.entity");
const sales_invoice_controller_1 = require("./presentation/controllers/sales-invoice.controller");
const sales_invoice_service_1 = require("./application/services/sales-invoice.service");
const sales_permission_entity_1 = require("./domain/entities/sales-permission.entity");
const sales_permission_item_entity_1 = require("./domain/entities/sales-permission-item.entity");
const sales_permission_factor_entity_1 = require("./domain/entities/sales-permission-factor.entity");
const sales_permission_controller_1 = require("./presentation/controllers/sales-permission.controller");
const sales_permission_service_1 = require("./application/services/sales-permission.service");
const sales_return_permission_entity_1 = require("./domain/entities/sales-return-permission.entity");
const sales_return_permission_item_entity_1 = require("./domain/entities/sales-return-permission-item.entity");
const sales_return_permission_factor_entity_1 = require("./domain/entities/sales-return-permission-factor.entity");
const sales_return_permission_controller_1 = require("./presentation/controllers/sales-return-permission.controller");
const sales_return_permission_service_1 = require("./application/services/sales-return-permission.service");
const base_document_controller_1 = require("./presentation/controllers/base-document.controller");
const base_document_service_1 = require("./application/services/base-document.service");
const core_module_1 = require("../../core/core.module");
const common_module_1 = require("../common/common.module");
let SleModule = class SleModule {
};
exports.SleModule = SleModule;
exports.SleModule = SleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                customer_group_entity_1.CustomerGroup,
                wallet_entity_1.Wallet,
                sales_channel_entity_1.SalesChannel,
                sales_type_entity_1.SalesType,
                delivery_location_entity_1.DeliveryLocation,
                sales_center_entity_1.SalesCenter,
                customer_entity_1.Customer,
                sales_account_category_entity_1.SalesAccountCategory,
                sales_item_group_entity_1.SalesItemGroup,
                sales_item_group_related_product_entity_1.SalesItemGroupRelatedProduct,
                sales_document_settings_entity_1.SalesDocumentSettings,
                settlement_method_entity_1.SettlementMethod,
                sales_order_entity_1.SalesOrder,
                sales_order_item_entity_1.SalesOrderItem,
                sales_order_factor_entity_1.SalesOrderFactor,
                sales_proforma_invoice_entity_1.SalesProformaInvoice,
                sales_proforma_invoice_item_entity_1.SalesProformaInvoiceItem,
                sales_proforma_invoice_factor_entity_1.SalesProformaInvoiceFactor,
                sales_contract_entity_1.SalesContract,
                sales_contract_item_entity_1.SalesContractItem,
                sales_contract_factor_entity_1.SalesContractFactor,
                sales_invoice_entity_1.SalesInvoice,
                sales_invoice_item_entity_1.SalesInvoiceItem,
                sales_invoice_factor_entity_1.SalesInvoiceFactor,
                sales_permission_entity_1.SalesPermission,
                sales_permission_item_entity_1.SalesPermissionItem,
                sales_permission_factor_entity_1.SalesPermissionFactor,
                sales_return_permission_entity_1.SalesReturnPermission,
                sales_return_permission_item_entity_1.SalesReturnPermissionItem,
                sales_return_permission_factor_entity_1.SalesReturnPermissionFactor,
            ]),
            core_module_1.CoreModule,
            common_module_1.CommonModule,
        ],
        controllers: [
            customer_group_controller_1.CustomerGroupController,
            wallet_controller_1.WalletController,
            sales_channel_controller_1.SalesChannelController,
            sales_type_controller_1.SalesTypeController,
            delivery_location_controller_1.DeliveryLocationController,
            sales_center_controller_1.SalesCenterController,
            customer_controller_1.CustomerController,
            sales_account_category_controller_1.SalesAccountCategoryController,
            sales_item_group_controller_1.SalesItemGroupController,
            sales_document_settings_controller_1.SalesDocumentSettingsController,
            settlement_method_controller_1.SettlementMethodController,
            sales_order_controller_1.SalesOrderController,
            sales_proforma_invoice_controller_1.SalesProformaInvoiceController,
            sales_contract_controller_1.SalesContractController,
            sales_invoice_controller_1.SalesInvoiceController,
            sales_permission_controller_1.SalesPermissionController,
            sales_return_permission_controller_1.SalesReturnPermissionController,
            base_document_controller_1.SleBaseDocumentController,
        ],
        providers: [
            {
                provide: customer_group_repository_interface_1.ICustomerGroupRepositoryToken,
                useClass: customer_group_repository_1.CustomerGroupRepository,
            },
            customer_group_service_1.CustomerGroupService,
            {
                provide: wallet_repository_interface_1.IWalletRepositoryToken,
                useClass: wallet_repository_1.WalletRepository,
            },
            wallet_service_1.WalletService,
            {
                provide: sales_channel_repository_interface_1.ISalesChannelRepositoryToken,
                useClass: sales_channel_repository_1.SalesChannelRepository,
            },
            sales_channel_service_1.SalesChannelService,
            {
                provide: sales_type_repository_interface_1.ISalesTypeRepositoryToken,
                useClass: sales_type_repository_1.SalesTypeRepository,
            },
            sales_type_service_1.SalesTypeService,
            {
                provide: delivery_location_repository_interface_1.IDeliveryLocationRepositoryToken,
                useClass: delivery_location_repository_1.DeliveryLocationRepository,
            },
            delivery_location_service_1.DeliveryLocationService,
            {
                provide: sales_center_repository_interface_1.ISalesCenterRepositoryToken,
                useClass: sales_center_repository_1.SalesCenterRepository,
            },
            sales_center_service_1.SalesCenterService,
            {
                provide: customer_repository_interface_1.ICustomerRepositoryToken,
                useClass: customer_repository_1.CustomerRepository,
            },
            customer_service_1.CustomerService,
            {
                provide: sales_account_category_repository_interface_1.ISalesAccountCategoryRepositoryToken,
                useClass: sales_account_category_repository_1.SalesAccountCategoryRepository,
            },
            sales_account_category_service_1.SalesAccountCategoryService,
            {
                provide: sales_item_group_repository_interface_1.ISalesItemGroupRepositoryToken,
                useClass: sales_item_group_repository_1.SalesItemGroupRepository,
            },
            sales_item_group_service_1.SalesItemGroupService,
            {
                provide: sales_document_settings_repository_interface_1.ISalesDocumentSettingsRepositoryToken,
                useClass: sales_document_settings_repository_1.SalesDocumentSettingsRepository,
            },
            sales_document_settings_service_1.SalesDocumentSettingsService,
            {
                provide: settlement_method_repository_interface_1.ISettlementMethodRepositoryToken,
                useClass: settlement_method_repository_1.SettlementMethodRepository,
            },
            settlement_method_service_1.SettlementMethodService,
            sales_order_service_1.SalesOrderService,
            sales_proforma_invoice_service_1.SalesProformaInvoiceService,
            sales_contract_service_1.SalesContractService,
            sales_invoice_service_1.SalesInvoiceService,
            sales_permission_service_1.SalesPermissionService,
            sales_return_permission_service_1.SalesReturnPermissionService,
            base_document_service_1.SleBaseDocumentService,
        ],
        exports: [
            customer_group_service_1.CustomerGroupService,
            wallet_service_1.WalletService,
            sales_channel_service_1.SalesChannelService,
            sales_type_service_1.SalesTypeService,
            delivery_location_service_1.DeliveryLocationService,
            sales_center_service_1.SalesCenterService,
            customer_service_1.CustomerService,
            sales_account_category_service_1.SalesAccountCategoryService,
            sales_item_group_service_1.SalesItemGroupService,
            sales_document_settings_service_1.SalesDocumentSettingsService,
            settlement_method_service_1.SettlementMethodService,
            sales_order_service_1.SalesOrderService,
            sales_proforma_invoice_service_1.SalesProformaInvoiceService,
            sales_contract_service_1.SalesContractService,
            sales_invoice_service_1.SalesInvoiceService,
            sales_permission_service_1.SalesPermissionService,
            sales_return_permission_service_1.SalesReturnPermissionService,
        ],
    })
], SleModule);
//# sourceMappingURL=sle.module.js.map