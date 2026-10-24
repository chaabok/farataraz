import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ReceivedChequeOperation } from './received-cheque-operation.entity';
import { ReceiptCheque } from './receipt-cheque.entity';
import { Cash } from './cash.entity';

@Entity({ schema: 'Rap', name: 'ReceivedChequeOperationItem' })
export class ReceivedChequeOperationItem {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'ReceivedChequeOperationItemID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  receivedChequeOperationItemId: number;

  @Column({ name: 'OperationRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  operationRef: number;

  @ManyToOne(() => ReceivedChequeOperation, op => op.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'OperationRef', referencedColumnName: 'receivedChequeOperationId' })
  operation: ReceivedChequeOperation;

  @Column({ name: 'ReceiptChequeRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  receiptChequeRef: number;

  @ManyToOne(() => ReceiptCheque, { eager: true })
  @JoinColumn({ name: 'ReceiptChequeRef', referencedColumnName: 'receiptChequeId' })
  receiptCheque: ReceiptCheque;

  @Column({ name: 'ChequeStatus', type: 'int', nullable: true })
  chequeStatus: number | null; // 1: Received, 2: Protested

  @Column({ name: 'ForecastDate', type: 'varchar', length: 20, nullable: true })
  forecastDate: string | null;

  @Column({ name: 'CashRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number | null) => value,
    from: (value: any) => value !== null && value !== undefined ? parseInt(value.toString(), 10) : null
  }})
  cashRef: number | null;

  @ManyToOne(() => Cash, { eager: true, nullable: true })
  @JoinColumn({ name: 'CashRef', referencedColumnName: 'cashId' })
  cash: Cash;
}
