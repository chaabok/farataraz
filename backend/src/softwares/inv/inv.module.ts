import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementUnit } from './domain/entities/measurement-unit.entity';
import { Warehouse } from './domain/entities/warehouse.entity';
import { WarehouseProduct } from './domain/entities/warehouse-product.entity';
import { WarehouseUser } from './domain/entities/warehouse-user.entity';
import { WarehouseAddress } from './domain/entities/warehouse-address.entity';
import { WarehouseKeeper } from './domain/entities/warehouse-keeper.entity';
import { ItemAccountCategory } from './domain/entities/item-account-category.entity';
import { Item } from './domain/entities/item.entity';
import { ItemPhysicalLocation } from './domain/entities/item-physical-location.entity';
import { ItemSubUnit } from './domain/entities/item-sub-unit.entity';
import { ItemInventoryControl } from './domain/entities/item-inventory-control.entity';
import { ItemVolumeCbm } from './domain/entities/item-volume-cbm.entity';
import { ItemServiceGroup } from './domain/entities/item-service-group.entity';
import { ItemServiceGroupField } from './domain/entities/item-service-group-field.entity';
import { ItemServiceGroupRelatedProduct } from './domain/entities/item-service-group-related-product.entity';
import { StandardItemRate } from './domain/entities/standard-item-rate.entity';
import { StandardItemRateDetail } from './domain/entities/standard-item-rate-detail.entity';
import { TrackingFactor } from './domain/entities/tracking-factor.entity';
import { TrackingFactorItemRelated } from './domain/entities/tracking-factor-item-related.entity';
import { TrackingFactorConstantValue } from './domain/entities/tracking-factor-constant-value.entity';
import { WarehouseDocumentType } from './domain/entities/warehouse-document-type.entity';
import { PurchaseSalesParameter } from './domain/entities/purchase-sales-parameter.entity';
import { PurchaseSalesParameterValue } from './domain/entities/purchase-sales-parameter-value.entity';
import { ItemRequest } from './domain/entities/item-request.entity';
import { ItemRequestDetail } from './domain/entities/item-request-detail.entity';
import { ItemRequestTrackingFactor } from './domain/entities/item-request-tracking-factor.entity';
import { ServiceRequest } from './domain/entities/service-request.entity';
import { ServiceRequestDetail } from './domain/entities/service-request-detail.entity';
import { ItemSupplyRequest } from './domain/entities/item-supply-request.entity';
import { ItemSupplyRequestDetail } from './domain/entities/item-supply-request-detail.entity';
import { ItemSupplyRequestTrackingFactor } from './domain/entities/item-supply-request-tracking-factor.entity';
import { ServiceSupplyRequest } from './domain/entities/service-supply-request.entity';
import { ServiceSupplyRequestDetail } from './domain/entities/service-supply-request-detail.entity';
import { DetailedAccount } from '../accounting/domain/entities/detailed-account.entity';
import { ItemPackage } from './domain/entities/item-package.entity';
import { ItemPackageDetail } from './domain/entities/item-package-detail.entity';
import { PurchaseInvoice } from './domain/entities/purchase-invoice.entity';
import { PurchaseInvoiceDetail } from './domain/entities/purchase-invoice-detail.entity';
import { PurchaseInvoiceFactor } from './domain/entities/purchase-invoice-factor.entity';
import { PurchaseInvoiceTrackingFactor } from './domain/entities/purchase-invoice-tracking-factor.entity';
import { ServicePurchaseInvoice } from './domain/entities/service-purchase-invoice.entity';
import { ServicePurchaseInvoiceDetail } from './domain/entities/service-purchase-invoice-detail.entity';
import { ServicePurchaseInvoiceFactor } from './domain/entities/service-purchase-invoice-factor.entity';
import { TemporaryItemReceipt } from './domain/entities/temporary-item-receipt.entity';
import { TemporaryItemReceiptDetail } from './domain/entities/temporary-item-receipt-detail.entity';
import { TemporaryItemReceiptFactor } from './domain/entities/temporary-item-receipt-factor.entity';
import { TemporaryItemReceiptTrackingFactor } from './domain/entities/temporary-item-receipt-tracking-factor.entity';
import { WarehouseReceipt } from './domain/entities/warehouse-receipt.entity';
import { WarehouseReceiptDetail } from './domain/entities/warehouse-receipt-detail.entity';
import { WarehouseReceiptFactor } from './domain/entities/warehouse-receipt-factor.entity';
import { WarehouseIssueTrackingFactor } from './domain/entities/warehouse-issue-tracking-factor.entity';
import { WarehouseReceiptTrackingFactor } from './domain/entities/warehouse-receipt-tracking-factor.entity';
import { StocktakingSetting } from './domain/entities/stocktaking-setting.entity';
import { StocktakingSettingWarehouse } from './domain/entities/stocktaking-setting-warehouse.entity';
import { StocktakingSettingController } from './presentation/controllers/stocktaking-setting.controller';
import { StocktakingSettingService } from './application/services/stocktaking-setting.service';
import { StocktakingTagHeader } from './domain/entities/stocktaking-tag-header.entity';
import { StocktakingTagDetail } from './domain/entities/stocktaking-tag-detail.entity';
import { StocktakingTag } from './domain/entities/stocktaking-tag.entity';
import { StocktakingTagController } from './presentation/controllers/stocktaking-tag.controller';
import { StocktakingTagService } from './application/services/stocktaking-tag.service';
import { StocktakingCount } from './domain/entities/stocktaking-count.entity';
import { StocktakingCountDetail } from './domain/entities/stocktaking-count-detail.entity';
import { StocktakingCountTrackingFactor } from './domain/entities/stocktaking-count-tracking-factor.entity';
import { StocktakingCountController } from './presentation/controllers/stocktaking-count.controller';
import { StocktakingCountService } from './application/services/stocktaking-count.service';
import { WarehouseVouchersPricing } from './domain/entities/warehouse-vouchers-pricing.entity';
import { WarehouseVouchersPricingController } from './presentation/controllers/warehouse-vouchers-pricing.controller';
import { WarehouseVouchersPricingService } from './application/services/warehouse-vouchers-pricing.service';
import { ItemPackageController } from './presentation/controllers/item-package.controller';
import { ItemPackageService } from './application/services/item-package.service';
import { MeasurementUnitController } from './presentation/controllers/measurement-unit.controller';
import { WarehouseController } from './presentation/controllers/warehouse.controller';
import { ItemAccountCategoryController } from './presentation/controllers/item-account-category.controller';
import { ItemController } from './presentation/controllers/item.controller';
import { ItemServiceGroupController } from './presentation/controllers/item-service-group.controller';
import { StandardItemRateController } from './presentation/controllers/standard-item-rate.controller';
import { TrackingFactorController } from './presentation/controllers/tracking-factor.controller';
import { WarehouseDocumentTypeController } from './presentation/controllers/warehouse-document-type.controller';
import { PurchaseSalesParameterController } from './presentation/controllers/purchase-sales-parameter.controller';
import { ItemRequestController } from './presentation/controllers/item-request.controller';
import { ServiceRequestController } from './presentation/controllers/service-request.controller';
import { ItemSupplyRequestController } from './presentation/controllers/item-supply-request.controller';
import { ServiceSupplyRequestController } from './presentation/controllers/service-supply-request.controller';
import { PurchaseInvoiceController } from './presentation/controllers/purchase-invoice.controller';
import { ServicePurchaseInvoiceController } from './presentation/controllers/service-purchase-invoice.controller';
import { TemporaryItemReceiptController } from './presentation/controllers/temporary-item-receipt.controller';
import { WarehouseReceiptController } from './presentation/controllers/warehouse-receipt.controller';
import { BaseDocumentController } from './presentation/controllers/base-document.controller';
import { BaseDocumentService } from './application/services/base-document.service';
import { MeasurementUnitService } from './application/services/measurement-unit.service';
import { WarehouseService } from './application/services/warehouse.service';
import { ItemAccountCategoryService } from './application/services/item-account-category.service';
import { ItemService } from './application/services/item.service';
import { ItemServiceGroupService } from './application/services/item-service-group.service';
import { StandardItemRateService } from './application/services/standard-item-rate.service';
import { TrackingFactorService } from './application/services/tracking-factor.service';
import { WarehouseDocumentTypeService } from './application/services/warehouse-document-type.service';
import { PurchaseSalesParameterService } from './application/services/purchase-sales-parameter.service';
import { ItemRequestService } from './application/services/item-request.service';
import { ServiceRequestService } from './application/services/service-request.service';
import { ItemSupplyRequestService } from './application/services/item-supply-request.service';
import { ServiceSupplyRequestService } from './application/services/service-supply-request.service';
import { PurchaseInvoiceService } from './application/services/purchase-invoice.service';
import { ServicePurchaseInvoiceService } from './application/services/service-purchase-invoice.service';
import { TemporaryItemReceiptService } from './application/services/temporary-item-receipt.service';
import { WarehouseReceiptService } from './application/services/warehouse-receipt.service';
import { MeasurementUnitRepository } from './infrastructure/repositories/measurement-unit.repository';
import { WarehouseRepository } from './infrastructure/repositories/warehouse.repository';
import { ItemAccountCategoryRepository } from './infrastructure/repositories/item-account-category.repository';
import { ItemRepository } from './infrastructure/repositories/item.repository';
import { ItemServiceGroupRepository } from './infrastructure/repositories/item-service-group.repository';
import { StandardItemRateRepository } from './infrastructure/repositories/standard-item-rate.repository';
import { TrackingFactorRepository } from './infrastructure/repositories/tracking-factor.repository';
import { WarehouseDocumentTypeRepository } from './infrastructure/repositories/warehouse-document-type.repository';
import { PurchaseSalesParameterRepository } from './infrastructure/repositories/purchase-sales-parameter.repository';
import { IMeasurementUnitRepository } from './domain/repositories/measurement-unit.repository.interface';
import { IWarehouseRepositoryToken } from './domain/repositories/warehouse.repository.interface';
import { IItemAccountCategoryRepositoryToken } from './domain/repositories/item-account-category.repository.interface';
import { IItemRepositoryToken } from './domain/repositories/item.repository.interface';
import { IItemServiceGroupRepositoryToken } from './domain/repositories/item-service-group.repository.interface';
import { IStandardItemRateRepositoryToken } from './domain/repositories/standard-item-rate.repository.interface';
import { ITrackingFactorRepositoryToken } from './domain/repositories/tracking-factor.repository.interface';
import { IWarehouseDocumentTypeRepositoryToken } from './domain/repositories/warehouse-document-type.repository.interface';
import { IPurchaseSalesParameterRepositoryToken } from './domain/repositories/purchase-sales-parameter.repository.interface';
import { CoreModule } from '../../core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MeasurementUnit,
      Warehouse,
      WarehouseProduct,
      WarehouseUser,
      WarehouseAddress,
      WarehouseKeeper,
      ItemAccountCategory,
      Item,
      ItemPhysicalLocation,
      ItemSubUnit,
      ItemInventoryControl,
      ItemVolumeCbm,
      ItemServiceGroup,
      ItemServiceGroupField,
      ItemServiceGroupRelatedProduct,
      StandardItemRate,
      StandardItemRateDetail,
      TrackingFactor,
      TrackingFactorItemRelated,
      TrackingFactorConstantValue,
      WarehouseDocumentType,
      PurchaseSalesParameter,
      PurchaseSalesParameterValue,
      ItemRequest,
      ItemRequestDetail,
      ItemRequestTrackingFactor,
      ServiceRequest,
      ServiceRequestDetail,
      ItemSupplyRequest,
      ItemSupplyRequestDetail,
      ItemSupplyRequestTrackingFactor,
      ServiceSupplyRequest,
      ServiceSupplyRequestDetail,
      DetailedAccount,
      ItemPackage,
      ItemPackageDetail,
      PurchaseInvoice,
      PurchaseInvoiceDetail,
      PurchaseInvoiceFactor,
      PurchaseInvoiceTrackingFactor,
      ServicePurchaseInvoice,
      ServicePurchaseInvoiceDetail,
      ServicePurchaseInvoiceFactor,
      TemporaryItemReceipt,
      TemporaryItemReceiptDetail,
      TemporaryItemReceiptFactor,
      TemporaryItemReceiptTrackingFactor,
      WarehouseReceipt,
      WarehouseReceiptDetail,
      WarehouseReceiptFactor,
      WarehouseIssueTrackingFactor,
      WarehouseReceiptTrackingFactor,
      WarehouseVouchersPricing,
      StocktakingSetting,
      StocktakingSettingWarehouse,
      StocktakingTagHeader,
      StocktakingTagDetail,
      StocktakingTag,
      StocktakingCount,
      StocktakingCountDetail,
      StocktakingCountTrackingFactor,
    ]),
    CoreModule,
  ],
  controllers: [
    StocktakingSettingController,
    StocktakingTagController,
    StocktakingCountController,
    ItemPackageController,
    MeasurementUnitController,
    WarehouseController,
    ItemAccountCategoryController,
    ItemController,
    ItemServiceGroupController,
    StandardItemRateController,
    TrackingFactorController,
    WarehouseDocumentTypeController,
    PurchaseSalesParameterController,
    ItemRequestController,
    ServiceRequestController,
    ItemSupplyRequestController,
    ServiceSupplyRequestController,
    PurchaseInvoiceController,
    ServicePurchaseInvoiceController,
    TemporaryItemReceiptController,
    WarehouseReceiptController,
    WarehouseVouchersPricingController,
    BaseDocumentController,
  ],
  providers: [
    {
      provide: IMeasurementUnitRepository,
      useClass: MeasurementUnitRepository,
    },
    {
      provide: IWarehouseRepositoryToken,
      useClass: WarehouseRepository,
    },
    {
      provide: IItemAccountCategoryRepositoryToken,
      useClass: ItemAccountCategoryRepository,
    },
    {
      provide: IItemRepositoryToken,
      useClass: ItemRepository,
    },
    {
      provide: IItemServiceGroupRepositoryToken,
      useClass: ItemServiceGroupRepository,
    },

    {
      provide: IStandardItemRateRepositoryToken,
      useClass: StandardItemRateRepository,
    },
    {
      provide: ITrackingFactorRepositoryToken,
      useClass: TrackingFactorRepository,
    },
    {
      provide: IWarehouseDocumentTypeRepositoryToken,
      useClass: WarehouseDocumentTypeRepository,
    },
    {
      provide: IPurchaseSalesParameterRepositoryToken,
      useClass: PurchaseSalesParameterRepository,
    },
    MeasurementUnitService,
    WarehouseService,
    ItemAccountCategoryService,
    ItemService,
    ItemServiceGroupService,
    StandardItemRateService,
    TrackingFactorService,
    WarehouseDocumentTypeService,
    PurchaseSalesParameterService,
    ItemRequestService,
    ServiceRequestService,
    ItemSupplyRequestService,
    ServiceSupplyRequestService,
    ItemPackageService,
    PurchaseInvoiceService,
    ServicePurchaseInvoiceService,
    TemporaryItemReceiptService,
    WarehouseReceiptService,
    WarehouseVouchersPricingService,
    StocktakingSettingService,
    StocktakingTagService,
    StocktakingCountService,
    BaseDocumentService,
  ],
  exports: [
    MeasurementUnitService,
    WarehouseService,
    ItemAccountCategoryService,
    ItemService,
    ItemServiceGroupService,
    StandardItemRateService,
    TrackingFactorService,
    WarehouseDocumentTypeService,
    PurchaseSalesParameterService,
    ItemRequestService,
    ServiceRequestService,
    ItemSupplyRequestService,
    ServiceSupplyRequestService,
    ItemPackageService,
    PurchaseInvoiceService,
    ServicePurchaseInvoiceService,
    TemporaryItemReceiptService,
    WarehouseReceiptService,
    WarehouseVouchersPricingService,
    StocktakingSettingService,
    StocktakingTagService,
    StocktakingCountService,
  ]
})
export class InvModule {}
