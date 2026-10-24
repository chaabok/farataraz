import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Sle', name: 'SettlementMethods' })
export class SettlementMethod extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SettlementMethodID: number;

  @Column({ type: 'int', nullable: false })
  Code: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title2: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
