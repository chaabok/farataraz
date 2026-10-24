import { Entity, Column, PrimaryColumn, Generated, Index, Check } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'Currency' })
@Index(['code', 'businessStructureRef'], { unique: true })
@Index(['title', 'businessStructureRef'], { unique: true })
@Index(['titleEn', 'businessStructureRef'], { unique: true })
@Check('"ExchangeUnit" > 0')
@Check('"PrecisionCount" >= 0')
export class Currency extends AppBaseEntity {
  @PrimaryColumn({
    type: 'bigint', 
    name: 'CurrencyID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    currencyID: number;

  @Column({ type: 'int', name: 'Code' })
  code: number;

  @Column({ type: 'text', name: 'Title' })
  title: string;

  @Column({ type: 'text', name: 'Title_En' })
  titleEn: string;

  @Column({ type: 'int', name: 'ExchangeUnit' })
  exchangeUnit: number;

  @Column({ type: 'int', name: 'PrecisionCount' })
  precisionCount: number;

  @Column({ type: 'varchar', length: 50, name: 'PrecisionTitle', nullable: true })
  precisionTitle: string;

  @Column({ type: 'varchar', length: 50, name: 'PrecisionTitle_En', nullable: true })
  precisionTitleEn: string;

  @Column({ type: 'boolean', name: 'IsActive', default: true })
  isActive: boolean;
}
