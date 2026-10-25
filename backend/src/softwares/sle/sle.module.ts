import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerGroup } from './domain/entities/customer-group.entity';
import { CustomerGroupController } from './presentation/controllers/customer-group.controller';
import { CustomerGroupService } from './application/services/customer-group.service';
import { CustomerGroupRepository } from './infrastructure/repositories/customer-group.repository';
import { ICustomerGroupRepositoryToken } from './domain/repositories/customer-group.repository.interface';
import { Wallet } from './domain/entities/wallet.entity';
import { WalletController } from './presentation/controllers/wallet.controller';
import { WalletService } from './application/services/wallet.service';
import { WalletRepository } from './infrastructure/repositories/wallet.repository';
import { IWalletRepositoryToken } from './domain/repositories/wallet.repository.interface';
import { SalesChannel } from './domain/entities/sales-channel.entity';
import { SalesChannelController } from './presentation/controllers/sales-channel.controller';
import { SalesChannelService } from './application/services/sales-channel.service';
import { SalesChannelRepository } from './infrastructure/repositories/sales-channel.repository';
import { ISalesChannelRepositoryToken } from './domain/repositories/sales-channel.repository.interface';
import { SalesType } from './domain/entities/sales-type.entity';
import { SalesTypeController } from './presentation/controllers/sales-type.controller';
import { SalesTypeService } from './application/services/sales-type.service';
import { SalesTypeRepository } from './infrastructure/repositories/sales-type.repository';
import { ISalesTypeRepositoryToken } from './domain/repositories/sales-type.repository.interface';
import { DeliveryLocation } from './domain/entities/delivery-location.entity';
import { DeliveryLocationController } from './presentation/controllers/delivery-location.controller';
import { DeliveryLocationService } from './application/services/delivery-location.service';
import { DeliveryLocationRepository } from './infrastructure/repositories/delivery-location.repository';
import { IDeliveryLocationRepositoryToken } from './domain/repositories/delivery-location.repository.interface';
import { SalesCenter } from './domain/entities/sales-center.entity';
import { SalesCenterController } from './presentation/controllers/sales-center.controller';
import { SalesCenterService } from './application/services/sales-center.service';
import { SalesCenterRepository } from './infrastructure/repositories/sales-center.repository';
import { ISalesCenterRepositoryToken } from './domain/repositories/sales-center.repository.interface';
import { Customer } from './domain/entities/customer.entity';
import { CustomerController } from './presentation/controllers/customer.controller';
import { CustomerService } from './application/services/customer.service';
import { CustomerRepository } from './infrastructure/repositories/customer.repository';
import { ICustomerRepositoryToken } from './domain/repositories/customer.repository.interface';
import { SalesAccountCategory } from './domain/entities/sales-account-category.entity';
import { SalesAccountCategoryController } from './presentation/controllers/sales-account-category.controller';
import { SalesAccountCategoryService } from './application/services/sales-account-category.service';
import { SalesAccountCategoryRepository } from './infrastructure/repositories/sales-account-category.repository';
import { ISalesAccountCategoryRepositoryToken } from './domain/repositories/sales-account-category.repository.interface';
import { SalesItemGroup } from './domain/entities/sales-item-group.entity';
import { SalesItemGroupRelatedProduct } from './domain/entities/sales-item-group-related-product.entity';
import { SalesItemGroupController } from './presentation/controllers/sales-item-group.controller';
import { SalesItemGroupService } from './application/services/sales-item-group.service';
import { SalesItemGroupRepository } from './infrastructure/repositories/sales-item-group.repository';
import { ISalesItemGroupRepositoryToken } from './domain/repositories/sales-item-group.repository.interface';
import { SalesDocumentSettings } from './domain/entities/sales-document-settings.entity';
import { SalesDocumentSettingsController } from './presentation/controllers/sales-document-settings.controller';
import { SalesDocumentSettingsService } from './application/services/sales-document-settings.service';
import { SalesDocumentSettingsRepository } from './infrastructure/repositories/sales-document-settings.repository';
import { ISalesDocumentSettingsRepositoryToken } from './domain/repositories/sales-document-settings.repository.interface';
import { SettlementMethod } from './domain/entities/settlement-method.entity';
import { SettlementMethodController } from './presentation/controllers/settlement-method.controller';
import { SettlementMethodService } from './application/services/settlement-method.service';
import { SettlementMethodRepository } from './infrastructure/repositories/settlement-method.repository';
import { ISettlementMethodRepositoryToken } from './domain/repositories/settlement-method.repository.interface';
import { SalesOrder } from './domain/entities/sales-order.entity';
import { SalesOrderItem } from './domain/entities/sales-order-item.entity';
import { SalesOrderFactor } from './domain/entities/sales-order-factor.entity';
import { SalesOrderController } from './presentation/controllers/sales-order.controller';
import { SalesOrderService } from './application/services/sales-order.service';
import { CoreModule } from '../../core/core.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerGroup,
      Wallet,
      SalesChannel,
      SalesType,
      DeliveryLocation,
      SalesCenter,
      Customer,
      SalesAccountCategory,
      SalesItemGroup,
      SalesItemGroupRelatedProduct,
      SalesDocumentSettings,
      SettlementMethod,
      SalesOrder,
      SalesOrderItem,
      SalesOrderFactor,
    ]),
    CoreModule,
    CommonModule,
  ],
  controllers: [
    CustomerGroupController,
    WalletController,
    SalesChannelController,
    SalesTypeController,
    DeliveryLocationController,
    SalesCenterController,
    CustomerController,
    SalesAccountCategoryController,
    SalesItemGroupController,
    SalesDocumentSettingsController,
    SettlementMethodController,
    SalesOrderController,
  ],
  providers: [
    {
      provide: ICustomerGroupRepositoryToken,
      useClass: CustomerGroupRepository,
    },
    CustomerGroupService,
    {
      provide: IWalletRepositoryToken,
      useClass: WalletRepository,
    },
    WalletService,
    {
      provide: ISalesChannelRepositoryToken,
      useClass: SalesChannelRepository,
    },
    SalesChannelService,
    {
      provide: ISalesTypeRepositoryToken,
      useClass: SalesTypeRepository,
    },
    SalesTypeService,
    {
      provide: IDeliveryLocationRepositoryToken,
      useClass: DeliveryLocationRepository,
    },
    DeliveryLocationService,
    {
      provide: ISalesCenterRepositoryToken,
      useClass: SalesCenterRepository,
    },
    SalesCenterService,
    {
      provide: ICustomerRepositoryToken,
      useClass: CustomerRepository,
    },
    CustomerService,
    {
      provide: ISalesAccountCategoryRepositoryToken,
      useClass: SalesAccountCategoryRepository,
    },
    SalesAccountCategoryService,
    {
      provide: ISalesItemGroupRepositoryToken,
      useClass: SalesItemGroupRepository,
    },
    SalesItemGroupService,
    {
      provide: ISalesDocumentSettingsRepositoryToken,
      useClass: SalesDocumentSettingsRepository,
    },
    SalesDocumentSettingsService,
    {
      provide: ISettlementMethodRepositoryToken,
      useClass: SettlementMethodRepository,
    },
    SettlementMethodService,
    SalesOrderService,
  ],
  exports: [
    CustomerGroupService,
    WalletService,
    SalesChannelService,
    SalesTypeService,
    DeliveryLocationService,
    SalesCenterService,
    CustomerService,
    SalesAccountCategoryService,
    SalesItemGroupService,
    SalesDocumentSettingsService,
    SettlementMethodService,
    SalesOrderService,
  ],
})
export class SleModule {}
