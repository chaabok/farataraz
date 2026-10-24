import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Bank } from './bank.entity';
import { GeoLocation } from '../../../common/domain/entities/geo-location.entity';

@Entity({ schema: 'Rap', name: 'BankBranchs' })
export class BankBranch extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'BankBranchID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    bankBranchId: number;

  @Column({ name: 'BankID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  bankId: number;

  @ManyToOne(() => Bank, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'BankID', referencedColumnName: 'bankId' })
  bank: Bank;

  @Column({ name: 'BranchCode', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  branchCode: number | null;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true })
  latinTitle: string;

  @Column({ name: 'CityRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  cityRef: number | null;

  @ManyToOne(() => GeoLocation, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'CityRef', referencedColumnName: 'geolocationId' })
  city: GeoLocation;

  @Column({ name: 'Phone', type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'Address', type: 'text', nullable: true })
  address: string;

  @Column({ name: 'ContactName', type: 'varchar', length: 150, nullable: true })
  contactName: string;
}
