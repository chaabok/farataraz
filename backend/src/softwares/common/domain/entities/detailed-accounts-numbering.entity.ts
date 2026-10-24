import { Entity, PrimaryColumn, Column , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'DetailedAccountsNumbering' })
export class DetailedAccountsNumbering extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'DetailedAccountsNumberingID', 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ 
    name: 'DetailedTypesID', 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  detailedTypesId: number;

  @Column({ name: 'IsHeadquarterSelected', type: 'boolean', default: true })
  isHeadquarterSelected: boolean;

  @Column({ name: 'IsCompanySelected', type: 'boolean', default: false })
  isCompanySelected: boolean;

  @Column({ 
    name: 'StartNumber', 
    type: 'bigint', 
    default: 1,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
    }
  })
  startNumber: number;

  @Column({ 
    name: 'EndNumber', 
    type: 'bigint', 
    default: 1000,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1000
    }
  })
  endNumber: number;
}
