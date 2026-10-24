import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'PurchaseSalesParameterValues' })
export class PurchaseSalesParameterValue extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PurchaseSalesParameterValueID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  PurchaseSalesParameterValueID: number;

  @Column({ 
    name: 'PurchaseSalesParameterRef', 
    type: 'bigint', 
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  PurchaseSalesParameterRef: number;

  @Column({ name: 'RowNo', type: 'int', nullable: true, default: 1 })
  RowNo: number;

  @Column({ name: 'StartDate', type: 'varchar', length: 10, nullable: true })
  StartDate: string;

  @Column({ name: 'EndDate', type: 'varchar', length: 10, nullable: true })
  EndDate: string;

  @Column({ name: 'ParameterValue', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : 0
  }})
  ParameterValue: number;

  @Column({ name: 'Description', type: 'text', nullable: true })
  Description: string;

  @Column({ 
    name: 'ProductServiceRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  ProductServiceRef?: number | null;

  @Column({ name: 'ProductServiceCode', type: 'varchar', length: 100, nullable: true })
  ProductServiceCode?: string | null;

  @Column({ name: 'ProductServiceName', type: 'varchar', length: 250, nullable: true })
  ProductServiceName?: string | null;

  @Column({ name: 'MeasurementUnitName', type: 'varchar', length: 100, nullable: true })
  MeasurementUnitName?: string | null;
}
