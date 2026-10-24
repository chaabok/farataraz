import { Entity, PrimaryColumn, Column, Index , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankType } from './bank-type.enum';

@Entity({ schema: 'Rap', name: 'Banks' })
export class Bank extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'BankID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    bankId: number;

  @Column({ name: 'Code', type: 'bigint', nullable: false, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  code: number;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true })
  latinTitle: string;

  @Column({ name: 'BankType', type: 'int', nullable: false, default: BankType.Government })
  bankType: BankType;

  @Column({ name: 'SwiftCode', type: 'varchar', length: 20, nullable: true })
  swiftCode: string;

  @Column({ name: 'NationalityRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  nationalityRef: number | null;

  @Column({ name: 'Phone', type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'Website', type: 'varchar', length: 200, nullable: true })
  website: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;
}
