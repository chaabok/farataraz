import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Cash } from './cash.entity';
import { User } from '../../../../core/iam/entities/user.entity';

@Entity({ schema: 'Rap', name: 'Cashiers' })
export class Cashier extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'CashierID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    cashierId: number;

  @Column({ name: 'CashID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  cashId: number;

  @ManyToOne(() => Cash, cash => cash.cashiers, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'CashID', referencedColumnName: 'cashId' })
  cash: Cash;

  @Column({ name: 'UserID', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  userId: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'UserID', referencedColumnName: 'id' })
  user: User;
}
