import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';

export enum RapReasonNature {
  SOURCE = 1,   // منابع
  USE = 2,      // مصارف
  NEUTRAL = 3, // خنثی
}

@Entity({ schema: 'Rap', name: 'Reasons' })
export class RapReason extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  RapReasonID: number;

  @Column({ length: 50, nullable: true })
  Code: string;

  @Column({ length: 255 })
  Title: string;

  @Column({ length: 255, nullable: true })
  Title_En: string;

  @Column({ type: 'bigint', nullable: true })
  AccountRef: number;

  @Column({ type: 'int', default: RapReasonNature.NEUTRAL })
  Nature: RapReasonNature;

  @Column({ length: 1000, nullable: true })
  Description: string;

  @Column({ default: true })
  IsActive: boolean;

  @Column({ type: 'bigint', nullable: true })
  ParentRef: number;

  @ManyToOne(() => RapReason, { nullable: true })
  @JoinColumn({ name: 'ParentRef' })
  Parent: RapReason;

  @OneToMany(() => RapReason, reason => reason.Parent)
  Children: RapReason[];

  @ManyToOne(() => BusinessStructure)
  @JoinColumn({ name: 'BusinessStructureRef' })
  BusinessStructure: BusinessStructure;

  @ManyToOne(() => BusinessStructure)
  @JoinColumn({ name: 'CompanyRef' })
  Company: BusinessStructure;
}
