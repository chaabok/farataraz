import { Entity, PrimaryColumn, Column } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Rap', name: 'DocumentAccountingInfo' })
export class DocumentAccountingInfo extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'DocumentAccountingInfoID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  documentAccountingInfoId: number;

  @Column({ name: 'DocumentType', type: 'varchar', length: 100, nullable: false })
  documentType: string;

  @Column({ name: 'DocumentRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => parseInt(value.toString(), 10)
  }})
  documentRef: number;

  @Column({ name: 'RowType', type: 'varchar', length: 100, nullable: true })
  rowType: string;

  @Column({ name: 'RowRef', type: 'bigint', nullable: true, transformer: {
    to: (value: number) => value,
    from: (value: any) => value ? parseInt(value.toString(), 10) : null
  }})
  rowRef: number;

  @Column({ name: 'OpDetail1Ref', type: 'bigint', nullable: true }) opDetail1Ref: number;
  @Column({ name: 'OpDetail2Ref', type: 'bigint', nullable: true }) opDetail2Ref: number;
  @Column({ name: 'OpDetail3Ref', type: 'bigint', nullable: true }) opDetail3Ref: number;
  @Column({ name: 'OpDetail4Ref', type: 'bigint', nullable: true }) opDetail4Ref: number;
  @Column({ name: 'OpDetail5Ref', type: 'bigint', nullable: true }) opDetail5Ref: number;
  @Column({ name: 'OpDetail6Ref', type: 'bigint', nullable: true }) opDetail6Ref: number;

  @Column({ name: 'ForDetail1Ref', type: 'bigint', nullable: true }) forDetail1Ref: number;
  @Column({ name: 'ForDetail2Ref', type: 'bigint', nullable: true }) forDetail2Ref: number;
  @Column({ name: 'ForDetail3Ref', type: 'bigint', nullable: true }) forDetail3Ref: number;
  @Column({ name: 'ForDetail4Ref', type: 'bigint', nullable: true }) forDetail4Ref: number;
  @Column({ name: 'ForDetail5Ref', type: 'bigint', nullable: true }) forDetail5Ref: number;
  @Column({ name: 'ForDetail6Ref', type: 'bigint', nullable: true }) forDetail6Ref: number;
}
