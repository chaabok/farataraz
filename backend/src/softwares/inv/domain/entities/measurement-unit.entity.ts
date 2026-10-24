import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Inv', name: 'MeasurementUnits' })
export class MeasurementUnit extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  MeasurementUnitID: number;

  @Column({ type: 'int', nullable: true })
  MeasurementUnitCode: number;

  @Column({ type: 'varchar', length: 150, nullable: true })
  MeasurementUnitName: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  MeasurementUnitName2: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;
}
