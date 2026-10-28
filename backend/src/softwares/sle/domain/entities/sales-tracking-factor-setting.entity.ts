import { Entity, PrimaryColumn, Column, Index } from 'typeorm';

/**
 * نمایش عامل ردیابی در فرم های فروش — one row per SalesDocumentType per business structure.
 * The checkbox list of this form is the SalesDocumentType enum (same source as تنظیمات اسناد فروش).
 * Unique on (SalesDocumentType, BusinessStructureRef).
 */
@Entity({ name: 'SalesTrackingFactorSettings', schema: 'Sle' })
@Index('UQ_SalesTrackingFactorSettings_Type_BS', ['SalesDocumentType', 'BusinessStructureRef'], { unique: true })
export class SalesTrackingFactorSetting {
  @PrimaryColumn({ type: 'bigint' })
  SalesTrackingFactorSettingID!: number;

  /** ID از enum SalesDocumentType (1..7) — never the label */
  @Column({ type: 'int', nullable: false })
  SalesDocumentType!: number;

  /** آیا عامل ردیابی در فرم های این نوع سند فروش نمایش داده شود */
  @Column({ type: 'boolean', default: false })
  ShowTrackingFactor!: boolean;

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
