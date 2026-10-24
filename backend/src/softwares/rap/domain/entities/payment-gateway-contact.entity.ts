import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentGateway } from './payment-gateway.entity';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Rap', name: 'PaymentGatewayContacts' })
export class PaymentGatewayContact extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaymentGatewayContactID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    paymentGatewayContactId: number;

  @Column({ name: 'PaymentGatewayRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  paymentGatewayRef: number;

  @ManyToOne(() => PaymentGateway, (pg) => pg.contacts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PaymentGatewayRef', referencedColumnName: 'paymentGatewayId' })
  paymentGateway: PaymentGateway;

  @Column({ name: 'Title', type: 'varchar', length: 150, nullable: true })
  title: string;

  @Column({ name: 'Title2', type: 'varchar', length: 150, nullable: true })
  title2: string;

  @Column({ name: 'PhoneNumber', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;
}
