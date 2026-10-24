import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'WarehouseDocumentTypes' })
export class WarehouseDocumentType extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'WarehouseDocumentTypeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  WarehouseDocumentTypeID: number;

  @Column({ name: 'WarehouseDocumentTypeCode', type: 'int', nullable: true })
  WarehouseDocumentTypeCode: number;

  @Column({ name: 'WarehouseDocumentTypeTitle', type: 'varchar', length: 200, nullable: true })
  WarehouseDocumentTypeTitle: string;

  @Column({ name: 'WarehouseDocumentTypeTitle2', type: 'varchar', length: 200, nullable: true })
  WarehouseDocumentTypeTitle2: string;

  @Column({ name: 'WarehouseDocumentNature', type: 'int', default: 1 })
  WarehouseDocumentNature: number;

  @Column({ name: 'HasBaseDocument', type: 'boolean', default: false })
  HasBaseDocument: boolean;

  @Column({ name: 'BaseDocumentTypeRefs', type: 'json', nullable: true })
  BaseDocumentTypeRefs: any;

  @Column({ name: 'WarehouseName', type: 'varchar', length: 200, nullable: true })
  WarehouseName: string;

  @Column({ name: 'DetailedName', type: 'varchar', length: 200, nullable: true })
  DetailedName: string;

  @Column({ name: 'RelatedDetailedTypeRefs', type: 'json', nullable: true })
  RelatedDetailedTypeRefs: any;

  @Column({ name: 'DisplayableItemNatures', type: 'json', nullable: true })
  DisplayableItemNatures: any;

  @Column({ name: 'ShowPurchaseSalesParameters', type: 'boolean', default: false })
  ShowPurchaseSalesParameters: boolean;

  @Column({ name: 'HasAccountingDocument', type: 'boolean', default: false })
  HasAccountingDocument: boolean;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  IsActive: boolean;
}
