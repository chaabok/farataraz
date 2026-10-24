import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';

@Entity({ schema: 'Gnr', name: 'PartiesAddresses' })
export class PartyAddress extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PartyAddressID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  partyAddressId: number;

  @Column({ name: 'PartyRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  partyRef: number;

  @ManyToOne(() => Party, (party) => party.partyAddresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'AddressType', type: 'varchar', length: 100, nullable: true })
  addressType: string;

  @Column({ name: 'City', type: 'varchar', length: 150, nullable: true })
  city: string;

  @Column({ name: 'FullAddress', type: 'varchar', length: 500, nullable: true })
  fullAddress: string;

  @Column({ name: 'PostalCode', type: 'varchar', length: 50, nullable: true })
  postalCode: string;

  @Column({ name: 'Longitude', type: 'varchar', length: 50, nullable: true })
  longitude: string;

  @Column({ name: 'Latitude', type: 'varchar', length: 50, nullable: true })
  latitude: string;
}
