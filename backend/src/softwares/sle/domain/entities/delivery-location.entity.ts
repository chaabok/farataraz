import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Sle', name: 'DeliveryLocations' })
export class DeliveryLocation extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  DeliveryLocationID: number;

  @Column({ type: 'bigint', nullable: false })
  Code: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title2: string;

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  Description: string;
}
