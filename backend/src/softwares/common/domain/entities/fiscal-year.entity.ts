import { Entity, Column, PrimaryColumn, Generated, Check } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'FiscalYear' })
@Check('"EndDate" >= "StartDate"')
export class FiscalYear extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint', 
    name: 'FiscalYearID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    fiscalYearID: number;

  @Column({ type: 'varchar', length: 50, nullable: false, name: 'Title' })
  title: string;

  @Column({ 
    type: 'date', 
    nullable: false, 
    name: 'StartDate',
    transformer: {
      to: (value: any) => value,
      from: (value: any) => {
        if (!value) return value;
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        if (typeof value === 'string') {
          return value.split('T')[0];
        }
        return value;
      }
    }
  })
  startDate: Date | string;

  @Column({ 
    type: 'date', 
    nullable: false, 
    name: 'EndDate',
    transformer: {
      to: (value: any) => value,
      from: (value: any) => {
        if (!value) return value;
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        if (typeof value === 'string') {
          return value.split('T')[0];
        }
        return value;
      }
    }
  })
  endDate: Date | string;

  @Column({ type: 'boolean', nullable: false, default: true, name: 'IsActive' })
  isActive: boolean;
}
