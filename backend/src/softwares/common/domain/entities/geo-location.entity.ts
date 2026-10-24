import { Entity, PrimaryColumn, Column, Unique , Generated} from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { GeographicType } from './geographic-type.enum';

@Entity({ schema: 'Gnr', name: 'GeoLocations' })
export class GeoLocation extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'GeolocationID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    geolocationId: number;

  @Column({ 
    name: 'ParentRef', 
    type: 'bigint', 
    nullable: false, 
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  parentRef: number;

  @Column({ name: 'GeographicType', type: 'int', nullable: false })
  geographicType: GeographicType;

  @Column({ name: 'Code', type: 'varchar', length: 100, nullable: false })
  code: string;

  @Column({ name: 'Title', type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ name: 'Title_En', type: 'varchar', length: 255, nullable: false })
  titleEn: string;

  @Column({ name: 'IsActive', type: 'boolean', default: true })
  isActive: boolean;
}
