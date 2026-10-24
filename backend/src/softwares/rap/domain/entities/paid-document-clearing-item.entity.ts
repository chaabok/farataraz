import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaidDocumentClearing } from './paid-document-clearing.entity';

@Entity({ schema: 'Rap', name: 'PaidDocumentClearingItem' })
export class PaidDocumentClearingItem extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PaidDocumentClearingItemID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  paidDocumentClearingItemId: number;

  @Column({ name: 'PaidDocumentClearingRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  paidDocumentClearingRef: number;

  @ManyToOne(() => PaidDocumentClearing, p => p.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PaidDocumentClearingRef', referencedColumnName: 'paidDocumentClearingId' })
  paidDocumentClearing: PaidDocumentClearing;

  @Column({ name: 'DocumentType', type: 'varchar', length: 50, nullable: false }) // 'cheque' or 'promissory_note'
  documentType: string;

  @Column({ name: 'DocumentId', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
  }})
  documentId: number;
}
