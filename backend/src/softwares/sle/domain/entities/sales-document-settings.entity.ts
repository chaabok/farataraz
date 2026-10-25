import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

/**
 * تنظیمات اسناد فروش — one row per SalesDocumentType per business structure.
 * Unique on (SalesDocumentType, BusinessStructureRef): the form upserts by type.
 */
@Entity({ name: 'SalesDocumentSettings', schema: 'Sle' })
@Index('UQ_SalesDocumentSettings_Type_BS', ['SalesDocumentType', 'BusinessStructureRef'], { unique: true })
export class SalesDocumentSettings {
  @PrimaryColumn({ type: 'bigint' })
  SalesDocumentSettingsID!: number;

  /** ID از enum SalesDocumentType (1..7) — never the label */
  @Column({ type: 'int', nullable: false })
  SalesDocumentType!: number;

  // --- سند مبنا ---
  @Column({ type: 'boolean', default: false })
  HasBaseDocument!: boolean;

  /** comma-separated SalesDocumentType IDs selected as base documents */
  @Column({ type: 'text', nullable: true })
  BaseDocumentTypes?: string;

  // --- نمایش انبار ---
  @Column({ type: 'boolean', default: false })
  ShowWarehouse!: boolean;

  @Column({ type: 'bigint', nullable: true })
  DefaultWarehouseRef?: number;

  // --- نمایش مرکز فروش ---
  @Column({ type: 'boolean', default: false })
  ShowSalesCenter!: boolean;

  @Column({ type: 'bigint', nullable: true })
  DefaultSalesCenterRef?: number;

  // --- نمایش نوع فروش ---
  @Column({ type: 'boolean', default: false })
  ShowSalesType!: boolean;

  @Column({ type: 'bigint', nullable: true })
  DefaultSalesTypeRef?: number;

  // --- نمایش مکان های تحویل ---
  @Column({ type: 'boolean', default: false })
  ShowDeliveryLocations!: boolean;

  @Column({ type: 'bigint', nullable: true })
  DefaultDeliveryLocationRef?: number;

  // --- نمایش روش تسویه ---
  @Column({ type: 'boolean', default: false })
  ShowSettlementMethod!: boolean;

  @Column({ type: 'bigint', nullable: true })
  DefaultSettlementMethodRef?: number;

  // --- دارای سند حسابداری ---
  @Column({ type: 'boolean', default: false })
  HasAccountingDocument!: boolean;

  // --- نمایش پارامترهای خرید و فروش ---
  @Column({ type: 'boolean', default: false })
  ShowPurchaseSalesParameters!: boolean;

  // --- فعال (default true per requirement) ---
  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  // Inherited / System fields (Rule 17)
  @Column({ type: 'bigint', nullable: true })
  BusinessStructureRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CompanyRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CreatorRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  CreationDate?: Date;

  @Column({ type: 'bigint', nullable: true })
  LastModifierRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  LastModificationDate?: Date;
}
