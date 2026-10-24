import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'PurchaseSalesParameters' })
export class PurchaseSalesParameter extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PurchaseSalesParameterID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  PurchaseSalesParameterID: number;

  @Column({ name: 'IsProcurement', type: 'boolean', default: false })
  IsProcurement: boolean;

  @Column({ name: 'IsWarehouse', type: 'boolean', default: true })
  IsWarehouse: boolean;

  @Column({ name: 'IsSales', type: 'boolean', default: false })
  IsSales: boolean;

  @Column({ name: 'Title', type: 'varchar', length: 200, nullable: true })
  Title: string;

  @Column({ name: 'Title2', type: 'varchar', length: 200, nullable: true })
  Title2: string;

  @Column({ name: 'CalculationPriority', type: 'int', default: 1 })
  CalculationPriority: number;

  @Column({ name: 'PrintPriority', type: 'int', default: 1 })
  PrintPriority: number;

  @Column({ name: 'ParameterType', type: 'int', default: 1 })
  ParameterType: number;

  @Column({ name: 'CalculationMethod', type: 'int', default: 1 })
  CalculationMethod: number;

  @Column({ name: 'CalculationCondition', type: 'int', default: 1 })
  CalculationCondition: number;

  @Column({ name: 'RelationType', type: 'int', default: 1 })
  RelationType: number;

  @Column({ name: 'OperationType', type: 'int', default: 1 })
  OperationType: number;

  @Column({ name: 'AmountAllocationMethod', type: 'int', default: 1 })
  AmountAllocationMethod: number;

  @Column({ name: 'CategoryOther', type: 'int', default: 1 })
  CategoryOther: number;

  @Column({ name: 'HasAccountingVoucher', type: 'boolean', default: false })
  HasAccountingVoucher: boolean;

  @Column({ 
    name: 'SlAccountRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  SlAccountRef: number;

  @Column({ name: 'IsNonDefiniteAmount', type: 'boolean', default: false })
  IsNonDefiniteAmount: boolean;

  @Column({ name: 'IsMandatory', type: 'boolean', default: false })
  IsMandatory: boolean;

  @Column({ name: 'IsFactorValueEditableByUser', type: 'boolean', default: false })
  IsFactorValueEditableByUser: boolean;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ name: 'Description', type: 'text', nullable: true })
  Description: string;
}
