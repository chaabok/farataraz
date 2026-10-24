import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'SalesTypes', schema: 'Sle' })
export class SalesType {
  @PrimaryColumn({ type: 'bigint' })
  SalesTypeID!: number;

  @Column({ type: 'int', nullable: false })
  Code!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Title!: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  Title2!: string;

  @Column({ type: 'boolean', default: true })
  IsActive!: boolean;

  @Column({ type: 'text', nullable: true })
  Description?: string;

  // Inherited / System fields at the end (Rule 17)
  @Column({ type: 'bigint', nullable: true })
  BusinessStructureRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CompanyRef?: number;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @Column({ type: 'bigint', nullable: true })
  CreatorRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  CreationDate?: Date;

  @Column({ type: 'bigint', nullable: true })
  LastModifierRef?: number;

  @Column({ type: 'timestamp', nullable: true })
  LastModificationDate?: Date;
}
