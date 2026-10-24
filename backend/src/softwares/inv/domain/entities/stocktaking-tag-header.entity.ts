import { Entity, Column, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingSetting } from './stocktaking-setting.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { StocktakingTagDetail } from './stocktaking-tag-detail.entity';

@Entity({ schema: 'Inv', name: 'StocktakingTagHeaders' })
export class StocktakingTagHeader extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  StocktakingTagHeaderID: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  StocktakingPeriod?: string;

  @Column({ type: 'bigint' })
  StocktakingSettingRef: number;

  @ManyToOne(() => StocktakingSetting, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'StocktakingSettingRef' })
  stocktakingSetting?: StocktakingSetting;

  @Column({ type: 'varchar', length: 20 })
  StocktakingDate: string;

  @Column({ type: 'bigint' })
  StocktakingNumber: number;

  @Column({ type: 'bigint', nullable: true })
  OfficerPartyRef: number;

  @Column({ type: 'text', nullable: true })
  Description?: string;

  @Column({ type: 'bigint', nullable: true })
  FiscalYearRef?: number;

  @ManyToOne(() => Party, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'OfficerPartyRef' })
  officerParty?: Party;

  @OneToMany(() => StocktakingTagDetail, (d) => d.header, { cascade: true })
  details?: StocktakingTagDetail[];
}
