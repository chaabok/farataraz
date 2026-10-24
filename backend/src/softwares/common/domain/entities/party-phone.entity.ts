import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';

@Entity({ schema: 'Gnr', name: 'PartiesPhones' })
export class PartyPhone extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PartyPhoneID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  partyPhoneId: number;

  @Column({ name: 'PartyRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  partyRef: number;

  @ManyToOne(() => Party, (party) => party.partyPhones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'PhoneType', type: 'varchar', length: 100, nullable: true })
  phoneType: string;

  @Column({ name: 'PhoneNumber', type: 'varchar', length: 50, nullable: true })
  phoneNumber: string;

  @Column({ name: 'Internal', type: 'varchar', length: 50, nullable: true })
  internal: string;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;
}
