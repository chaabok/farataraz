"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const measurement_unit_entity_1 = require("./domain/entities/measurement-unit.entity");
const warehouse_entity_1 = require("./domain/entities/warehouse.entity");
const warehouse_product_entity_1 = require("./domain/entities/warehouse-product.entity");
const warehouse_user_entity_1 = require("./domain/entities/warehouse-user.entity");
const warehouse_address_entity_1 = require("./domain/entities/warehouse-address.entity");
const warehouse_keeper_entity_1 = require("./domain/entities/warehouse-keeper.entity");
const item_account_category_entity_1 = require("./domain/entities/item-account-category.entity");
const item_entity_1 = require("./domain/entities/item.entity");
const item_physical_location_entity_1 = require("./domain/entities/item-physical-location.entity");
const item_sub_unit_entity_1 = require("./domain/entities/item-sub-unit.entity");
const item_inventory_control_entity_1 = require("./domain/entities/item-inventory-control.entity");
const item_volume_cbm_entity_1 = require("./domain/entities/item-volume-cbm.entity");
const item_service_group_entity_1 = require("./domain/entities/item-service-group.entity");
const item_service_group_field_entity_1 = require("./domain/entities/item-service-group-field.entity");
const item_service_group_related_product_entity_1 = require("./domain/entities/item-service-group-related-product.entity");
const standard_item_rate_entity_1 = require("./domain/entities/standard-item-rate.entity");
const standard_item_rate_detail_entity_1 = require("./domain/entities/standard-item-rate-detail.entity");
const tracking_factor_entity_1 = require("./domain/entities/tracking-factor.entity");
const tracking_factor_item_related_entity_1 = require("./domain/entities/tracking-factor-item-related.entity");
const tracking_factor_constant_value_entity_1 = require("./domain/entities/tracking-factor-constant-value.entity");
const warehouse_document_type_entity_1 = require("./domain/entities/warehouse-document-type.entity");
const purchase_sales_parameter_entity_1 = require("./domain/entities/purchase-sales-parameter.entity");
const purchase_sales_parameter_value_entity_1 = require("./domain/entities/purchase-sales-parameter-value.entity");
const item_request_entity_1 = require("./domain/entities/item-request.entity");
const item_request_detail_entity_1 = require("./domain/entities/item-request-detail.entity");
const item_request_tracking_factor_entity_1 = require("./domain/entities/item-request-tracking-factor.entity");
const service_request_entity_1 = require("./domain/entities/service-request.entity");
const service_request_detail_entity_1 = require("./domain/entities/service-request-detail.entity");
const item_supply_request_entity_1 = require("./domain/entities/item-supply-request.entity");
const item_supply_request_detail_entity_1 = require("./domain/entities/item-supply-request-detail.entity");
const item_supply_request_tracking_factor_entity_1 = require("./domain/entities/item-supply-request-tracking-factor.entity");
const service_supply_request_entity_1 = require("./domain/entities/service-supply-request.entity");
const service_supply_request_detail_entity_1 = require("./domain/entities/service-supply-request-detail.entity");
const detailed_account_entity_1 = require("../accounting/domain/entities/detailed-account.entity");
const item_package_entity_1 = require("./domain/entities/item-package.entity");
const item_package_detail_entity_1 = require("./domain/entities/item-package-detail.entity");
const purchase_invoice_entity_1 = require("./domain/entities/purchase-invoice.entity");
const purchase_invoice_detail_entity_1 = require("./domain/entities/purchase-invoice-detail.entity");
const purchase_invoice_factor_entity_1 = require("./domain/entities/purchase-invoice-factor.entity");
const purchase_invoice_tracking_factor_entity_1 = require("./domain/entities/purchase-invoice-tracking-factor.entity");
const service_purchase_invoice_entity_1 = require("./domain/entities/service-purchase-invoice.entity");
const service_purchase_invoice_detail_entity_1 = require("./domain/entities/service-purchase-invoice-detail.entity");
const service_purchase_invoice_factor_entity_1 = require("./domain/entities/service-purchase-invoice-factor.entity");
const temporary_item_receipt_entity_1 = require("./domain/entities/temporary-item-receipt.entity");
const temporary_item_receipt_detail_entity_1 = require("./domain/entities/temporary-item-receipt-detail.entity");
const temporary_item_receipt_factor_entity_1 = require("./domain/entities/temporary-item-receipt-factor.entity");
const temporary_item_receipt_tracking_factor_entity_1 = require("./domain/entities/temporary-item-receipt-tracking-factor.entity");
const warehouse_receipt_entity_1 = require("./domain/entities/warehouse-receipt.entity");
const warehouse_receipt_detail_entity_1 = require("./domain/entities/warehouse-receipt-detail.entity");
const warehouse_receipt_factor_entity_1 = require("./domain/entities/warehouse-receipt-factor.entity");
const warehouse_issue_tracking_factor_entity_1 = require("./domain/entities/warehouse-issue-tracking-factor.entity");
const warehouse_receipt_tracking_factor_entity_1 = require("./domain/entities/warehouse-receipt-tracking-factor.entity");
const stocktaking_setting_entity_1 = require("./domain/entities/stocktaking-setting.entity");
const stocktaking_setting_warehouse_entity_1 = require("./domain/entities/stocktaking-setting-warehouse.entity");
const stocktaking_setting_controller_1 = require("./presentation/controllers/stocktaking-setting.controller");
const stocktaking_setting_service_1 = require("./application/services/stocktaking-setting.service");
const stocktaking_tag_header_entity_1 = require("./domain/entities/stocktaking-tag-header.entity");
const stocktaking_tag_detail_entity_1 = require("./domain/entities/stocktaking-tag-detail.entity");
const stocktaking_tag_entity_1 = require("./domain/entities/stocktaking-tag.entity");
const stocktaking_tag_controller_1 = require("./presentation/controllers/stocktaking-tag.controller");
const stocktaking_tag_service_1 = require("./application/services/stocktaking-tag.service");
const stocktaking_count_entity_1 = require("./domain/entities/stocktaking-count.entity");
const stocktaking_count_detail_entity_1 = require("./domain/entities/stocktaking-count-detail.entity");
const stocktaking_count_tracking_factor_entity_1 = require("./domain/entities/stocktaking-count-tracking-factor.entity");
const stocktaking_count_controller_1 = require("./presentation/controllers/stocktaking-count.controller");
const stocktaking_count_service_1 = require("./application/services/stocktaking-count.service");
const warehouse_vouchers_pricing_entity_1 = require("./domain/entities/warehouse-vouchers-pricing.entity");
const warehouse_vouchers_pricing_controller_1 = require("./presentation/controllers/warehouse-vouchers-pricing.controller");
const warehouse_vouchers_pricing_service_1 = require("./application/services/warehouse-vouchers-pricing.service");
const item_package_controller_1 = require("./presentation/controllers/item-package.controller");
const item_package_service_1 = require("./application/services/item-package.service");
const measurement_unit_controller_1 = require("./presentation/controllers/measurement-unit.controller");
const warehouse_controller_1 = require("./presentation/controllers/warehouse.controller");
const item_account_category_controller_1 = require("./presentation/controllers/item-account-category.controller");
const item_controller_1 = require("./presentation/controllers/item.controller");
const item_service_group_controller_1 = require("./presentation/controllers/item-service-group.controller");
const standard_item_rate_controller_1 = require("./presentation/controllers/standard-item-rate.controller");
const tracking_factor_controller_1 = require("./presentation/controllers/tracking-factor.controller");
const warehouse_document_type_controller_1 = require("./presentation/controllers/warehouse-document-type.controller");
const purchase_sales_parameter_controller_1 = require("./presentation/controllers/purchase-sales-parameter.controller");
const item_request_controller_1 = require("./presentation/controllers/item-request.controller");
const service_request_controller_1 = require("./presentation/controllers/service-request.controller");
const item_supply_request_controller_1 = require("./presentation/controllers/item-supply-request.controller");
const service_supply_request_controller_1 = require("./presentation/controllers/service-supply-request.controller");
const purchase_invoice_controller_1 = require("./presentation/controllers/purchase-invoice.controller");
const service_purchase_invoice_controller_1 = require("./presentation/controllers/service-purchase-invoice.controller");
const temporary_item_receipt_controller_1 = require("./presentation/controllers/temporary-item-receipt.controller");
const warehouse_receipt_controller_1 = require("./presentation/controllers/warehouse-receipt.controller");
const base_document_controller_1 = require("./presentation/controllers/base-document.controller");
const base_document_service_1 = require("./application/services/base-document.service");
const measurement_unit_service_1 = require("./application/services/measurement-unit.service");
const warehouse_service_1 = require("./application/services/warehouse.service");
const item_account_category_service_1 = require("./application/services/item-account-category.service");
const item_service_1 = require("./application/services/item.service");
const item_service_group_service_1 = require("./application/services/item-service-group.service");
const standard_item_rate_service_1 = require("./application/services/standard-item-rate.service");
const tracking_factor_service_1 = require("./application/services/tracking-factor.service");
const warehouse_document_type_service_1 = require("./application/services/warehouse-document-type.service");
const purchase_sales_parameter_service_1 = require("./application/services/purchase-sales-parameter.service");
const item_request_service_1 = require("./application/services/item-request.service");
const service_request_service_1 = require("./application/services/service-request.service");
const item_supply_request_service_1 = require("./application/services/item-supply-request.service");
const service_supply_request_service_1 = require("./application/services/service-supply-request.service");
const purchase_invoice_service_1 = require("./application/services/purchase-invoice.service");
const service_purchase_invoice_service_1 = require("./application/services/service-purchase-invoice.service");
const temporary_item_receipt_service_1 = require("./application/services/temporary-item-receipt.service");
const warehouse_receipt_service_1 = require("./application/services/warehouse-receipt.service");
const measurement_unit_repository_1 = require("./infrastructure/repositories/measurement-unit.repository");
const warehouse_repository_1 = require("./infrastructure/repositories/warehouse.repository");
const item_account_category_repository_1 = require("./infrastructure/repositories/item-account-category.repository");
const item_repository_1 = require("./infrastructure/repositories/item.repository");
const item_service_group_repository_1 = require("./infrastructure/repositories/item-service-group.repository");
const standard_item_rate_repository_1 = require("./infrastructure/repositories/standard-item-rate.repository");
const tracking_factor_repository_1 = require("./infrastructure/repositories/tracking-factor.repository");
const warehouse_document_type_repository_1 = require("./infrastructure/repositories/warehouse-document-type.repository");
const purchase_sales_parameter_repository_1 = require("./infrastructure/repositories/purchase-sales-parameter.repository");
const measurement_unit_repository_interface_1 = require("./domain/repositories/measurement-unit.repository.interface");
const warehouse_repository_interface_1 = require("./domain/repositories/warehouse.repository.interface");
const item_account_category_repository_interface_1 = require("./domain/repositories/item-account-category.repository.interface");
const item_repository_interface_1 = require("./domain/repositories/item.repository.interface");
const item_service_group_repository_interface_1 = require("./domain/repositories/item-service-group.repository.interface");
const standard_item_rate_repository_interface_1 = require("./domain/repositories/standard-item-rate.repository.interface");
const tracking_factor_repository_interface_1 = require("./domain/repositories/tracking-factor.repository.interface");
const warehouse_document_type_repository_interface_1 = require("./domain/repositories/warehouse-document-type.repository.interface");
const purchase_sales_parameter_repository_interface_1 = require("./domain/repositories/purchase-sales-parameter.repository.interface");
const core_module_1 = require("../../core/core.module");
let InvModule = class InvModule {
};
exports.InvModule = InvModule;
exports.InvModule = InvModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                measurement_unit_entity_1.MeasurementUnit,
                warehouse_entity_1.Warehouse,
                warehouse_product_entity_1.WarehouseProduct,
                warehouse_user_entity_1.WarehouseUser,
                warehouse_address_entity_1.WarehouseAddress,
                warehouse_keeper_entity_1.WarehouseKeeper,
                item_account_category_entity_1.ItemAccountCategory,
                item_entity_1.Item,
                item_physical_location_entity_1.ItemPhysicalLocation,
                item_sub_unit_entity_1.ItemSubUnit,
                item_inventory_control_entity_1.ItemInventoryControl,
                item_volume_cbm_entity_1.ItemVolumeCbm,
                item_service_group_entity_1.ItemServiceGroup,
                item_service_group_field_entity_1.ItemServiceGroupField,
                item_service_group_related_product_entity_1.ItemServiceGroupRelatedProduct,
                standard_item_rate_entity_1.StandardItemRate,
                standard_item_rate_detail_entity_1.StandardItemRateDetail,
                tracking_factor_entity_1.TrackingFactor,
                tracking_factor_item_related_entity_1.TrackingFactorItemRelated,
                tracking_factor_constant_value_entity_1.TrackingFactorConstantValue,
                warehouse_document_type_entity_1.WarehouseDocumentType,
                purchase_sales_parameter_entity_1.PurchaseSalesParameter,
                purchase_sales_parameter_value_entity_1.PurchaseSalesParameterValue,
                item_request_entity_1.ItemRequest,
                item_request_detail_entity_1.ItemRequestDetail,
                item_request_tracking_factor_entity_1.ItemRequestTrackingFactor,
                service_request_entity_1.ServiceRequest,
                service_request_detail_entity_1.ServiceRequestDetail,
                item_supply_request_entity_1.ItemSupplyRequest,
                item_supply_request_detail_entity_1.ItemSupplyRequestDetail,
                item_supply_request_tracking_factor_entity_1.ItemSupplyRequestTrackingFactor,
                service_supply_request_entity_1.ServiceSupplyRequest,
                service_supply_request_detail_entity_1.ServiceSupplyRequestDetail,
                detailed_account_entity_1.DetailedAccount,
                item_package_entity_1.ItemPackage,
                item_package_detail_entity_1.ItemPackageDetail,
                purchase_invoice_entity_1.PurchaseInvoice,
                purchase_invoice_detail_entity_1.PurchaseInvoiceDetail,
                purchase_invoice_factor_entity_1.PurchaseInvoiceFactor,
                purchase_invoice_tracking_factor_entity_1.PurchaseInvoiceTrackingFactor,
                service_purchase_invoice_entity_1.ServicePurchaseInvoice,
                service_purchase_invoice_detail_entity_1.ServicePurchaseInvoiceDetail,
                service_purchase_invoice_factor_entity_1.ServicePurchaseInvoiceFactor,
                temporary_item_receipt_entity_1.TemporaryItemReceipt,
                temporary_item_receipt_detail_entity_1.TemporaryItemReceiptDetail,
                temporary_item_receipt_factor_entity_1.TemporaryItemReceiptFactor,
                temporary_item_receipt_tracking_factor_entity_1.TemporaryItemReceiptTrackingFactor,
                warehouse_receipt_entity_1.WarehouseReceipt,
                warehouse_receipt_detail_entity_1.WarehouseReceiptDetail,
                warehouse_receipt_factor_entity_1.WarehouseReceiptFactor,
                warehouse_issue_tracking_factor_entity_1.WarehouseIssueTrackingFactor,
                warehouse_receipt_tracking_factor_entity_1.WarehouseReceiptTrackingFactor,
                warehouse_vouchers_pricing_entity_1.WarehouseVouchersPricing,
                stocktaking_setting_entity_1.StocktakingSetting,
                stocktaking_setting_warehouse_entity_1.StocktakingSettingWarehouse,
                stocktaking_tag_header_entity_1.StocktakingTagHeader,
                stocktaking_tag_detail_entity_1.StocktakingTagDetail,
                stocktaking_tag_entity_1.StocktakingTag,
                stocktaking_count_entity_1.StocktakingCount,
                stocktaking_count_detail_entity_1.StocktakingCountDetail,
                stocktaking_count_tracking_factor_entity_1.StocktakingCountTrackingFactor,
            ]),
            core_module_1.CoreModule,
        ],
        controllers: [
            stocktaking_setting_controller_1.StocktakingSettingController,
            stocktaking_tag_controller_1.StocktakingTagController,
            stocktaking_count_controller_1.StocktakingCountController,
            item_package_controller_1.ItemPackageController,
            measurement_unit_controller_1.MeasurementUnitController,
            warehouse_controller_1.WarehouseController,
            item_account_category_controller_1.ItemAccountCategoryController,
            item_controller_1.ItemController,
            item_service_group_controller_1.ItemServiceGroupController,
            standard_item_rate_controller_1.StandardItemRateController,
            tracking_factor_controller_1.TrackingFactorController,
            warehouse_document_type_controller_1.WarehouseDocumentTypeController,
            purchase_sales_parameter_controller_1.PurchaseSalesParameterController,
            item_request_controller_1.ItemRequestController,
            service_request_controller_1.ServiceRequestController,
            item_supply_request_controller_1.ItemSupplyRequestController,
            service_supply_request_controller_1.ServiceSupplyRequestController,
            purchase_invoice_controller_1.PurchaseInvoiceController,
            service_purchase_invoice_controller_1.ServicePurchaseInvoiceController,
            temporary_item_receipt_controller_1.TemporaryItemReceiptController,
            warehouse_receipt_controller_1.WarehouseReceiptController,
            warehouse_vouchers_pricing_controller_1.WarehouseVouchersPricingController,
            base_document_controller_1.BaseDocumentController,
        ],
        providers: [
            {
                provide: measurement_unit_repository_interface_1.IMeasurementUnitRepository,
                useClass: measurement_unit_repository_1.MeasurementUnitRepository,
            },
            {
                provide: warehouse_repository_interface_1.IWarehouseRepositoryToken,
                useClass: warehouse_repository_1.WarehouseRepository,
            },
            {
                provide: item_account_category_repository_interface_1.IItemAccountCategoryRepositoryToken,
                useClass: item_account_category_repository_1.ItemAccountCategoryRepository,
            },
            {
                provide: item_repository_interface_1.IItemRepositoryToken,
                useClass: item_repository_1.ItemRepository,
            },
            {
                provide: item_service_group_repository_interface_1.IItemServiceGroupRepositoryToken,
                useClass: item_service_group_repository_1.ItemServiceGroupRepository,
            },
            {
                provide: standard_item_rate_repository_interface_1.IStandardItemRateRepositoryToken,
                useClass: standard_item_rate_repository_1.StandardItemRateRepository,
            },
            {
                provide: tracking_factor_repository_interface_1.ITrackingFactorRepositoryToken,
                useClass: tracking_factor_repository_1.TrackingFactorRepository,
            },
            {
                provide: warehouse_document_type_repository_interface_1.IWarehouseDocumentTypeRepositoryToken,
                useClass: warehouse_document_type_repository_1.WarehouseDocumentTypeRepository,
            },
            {
                provide: purchase_sales_parameter_repository_interface_1.IPurchaseSalesParameterRepositoryToken,
                useClass: purchase_sales_parameter_repository_1.PurchaseSalesParameterRepository,
            },
            measurement_unit_service_1.MeasurementUnitService,
            warehouse_service_1.WarehouseService,
            item_account_category_service_1.ItemAccountCategoryService,
            item_service_1.ItemService,
            item_service_group_service_1.ItemServiceGroupService,
            standard_item_rate_service_1.StandardItemRateService,
            tracking_factor_service_1.TrackingFactorService,
            warehouse_document_type_service_1.WarehouseDocumentTypeService,
            purchase_sales_parameter_service_1.PurchaseSalesParameterService,
            item_request_service_1.ItemRequestService,
            service_request_service_1.ServiceRequestService,
            item_supply_request_service_1.ItemSupplyRequestService,
            service_supply_request_service_1.ServiceSupplyRequestService,
            item_package_service_1.ItemPackageService,
            purchase_invoice_service_1.PurchaseInvoiceService,
            service_purchase_invoice_service_1.ServicePurchaseInvoiceService,
            temporary_item_receipt_service_1.TemporaryItemReceiptService,
            warehouse_receipt_service_1.WarehouseReceiptService,
            warehouse_vouchers_pricing_service_1.WarehouseVouchersPricingService,
            stocktaking_setting_service_1.StocktakingSettingService,
            stocktaking_tag_service_1.StocktakingTagService,
            stocktaking_count_service_1.StocktakingCountService,
            base_document_service_1.BaseDocumentService,
        ],
        exports: [
            measurement_unit_service_1.MeasurementUnitService,
            warehouse_service_1.WarehouseService,
            item_account_category_service_1.ItemAccountCategoryService,
            item_service_1.ItemService,
            item_service_group_service_1.ItemServiceGroupService,
            standard_item_rate_service_1.StandardItemRateService,
            tracking_factor_service_1.TrackingFactorService,
            warehouse_document_type_service_1.WarehouseDocumentTypeService,
            purchase_sales_parameter_service_1.PurchaseSalesParameterService,
            item_request_service_1.ItemRequestService,
            service_request_service_1.ServiceRequestService,
            item_supply_request_service_1.ItemSupplyRequestService,
            service_supply_request_service_1.ServiceSupplyRequestService,
            item_package_service_1.ItemPackageService,
            purchase_invoice_service_1.PurchaseInvoiceService,
            service_purchase_invoice_service_1.ServicePurchaseInvoiceService,
            temporary_item_receipt_service_1.TemporaryItemReceiptService,
            warehouse_receipt_service_1.WarehouseReceiptService,
            warehouse_vouchers_pricing_service_1.WarehouseVouchersPricingService,
            stocktaking_setting_service_1.StocktakingSettingService,
            stocktaking_tag_service_1.StocktakingTagService,
            stocktaking_count_service_1.StocktakingCountService,
        ]
    })
], InvModule);
//# sourceMappingURL=inv.module.js.map