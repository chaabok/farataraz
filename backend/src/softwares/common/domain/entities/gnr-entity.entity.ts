import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { EntityType } from './entity-type.enum';

@Entity({ name: 'Entities', schema: 'Gnr' })
export class GnrEntity extends AppBaseEntity {
  @PrimaryColumn({ 
    name: 'EntityID', 
    type: 'bigint',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : value
    }
  })
    entityID: number;

  @Column({ 
    name: 'ParentRef', 
    type: 'bigint', 
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
    }
  })
  parentRef: number | null;

  @Column({ name: 'EntityName', type: 'text', nullable: false })
  entityName: string;

  @Column({ 
    name: 'EntityType', 
    type: 'int', 
    nullable: false 
  })
  entityType: EntityType;

  @ManyToOne(() => GnrEntity, { nullable: true })
  @JoinColumn({ name: 'ParentRef' })
  parent?: GnrEntity;
}
