import { Entity, PrimaryColumn, Column, Generated } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Gnr', name: 'EntityNumbering' })
export class EntityNumbering extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'EntityNumberingID', 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    entityNumberingId: number;

  @Column({ name: 'EntityRef', type: 'varchar', length: 100 })
  entityRef: string;

  @Column({ name: 'NumberingMethod', type: 'varchar', length: 10, default: '2' })
  numberingMethod: string;

  @Column({ name: 'NumberingType', type: 'varchar', length: 10, default: '1' })
  numberingType: string;

  @Column({ name: 'BaseNumbering', type: 'simple-json', nullable: true })
  baseNumbering: string[];

  @Column({ name: 'Items', type: 'simple-json', nullable: true })
  items: any;
}
