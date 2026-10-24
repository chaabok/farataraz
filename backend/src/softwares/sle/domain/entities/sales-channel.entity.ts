import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Sle', name: 'SalesChannels' })
export class SalesChannel extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  SalesChannelID: number;

  @Column({ type: 'int', nullable: false })
  Code: number;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title: string;

  @Column({ type: 'varchar', length: 250, nullable: false })
  Title2: string;

  @Column({ type: 'int', nullable: false, default: 1 })
  Type: number; // 1: مستقیم, 2: وبسایت, 3: پلتفرم واسط, 4: شبکه های اجتماعی, 5: تلفنی, 6: شعب, 7: نمایندگی ها

  @Column({ type: 'boolean', default: true })
  IsActive: boolean;

  @Column({ type: 'varchar', length: 500, nullable: true })
  Description: string;
}
