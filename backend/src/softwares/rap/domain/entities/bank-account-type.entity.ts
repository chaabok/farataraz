import { Entity, PrimaryColumn, Column , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Rap', name: 'BankAccountTypes' })
export class BankAccountType extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'BankAccountTypeID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    bankAccountTypeId: number;

  @Column({ name: 'Code', type: 'bigint', nullable: false, default: 0, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  code: number;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: false })
  title: string;

  @Column({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true })
  latinTitle: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
