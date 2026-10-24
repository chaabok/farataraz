import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, Generated } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';

@Entity({ schema: 'Gnr', name: 'PartiesRelated' })
export class PartyRelated extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PartyRelatedID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    partyRelatedId: number;

  @Column({ name: 'PartyRef', type: 'bigint', nullable: false, transformer: {
    to: (value: number) => value,
    from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
  }})
  partyRef: number;

  @ManyToOne(() => Party, (party) => party.partyRelatedPersons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PartyRef', referencedColumnName: 'partyId' })
  party: Party;

  @Column({ name: 'FirstName', type: 'varchar', length: 150, nullable: false })
  firstName: string;

  @Column({ name: 'LastName', type: 'varchar', length: 150, nullable: false })
  lastName: string;

  @Column({ name: 'Relation', type: 'varchar', length: 150, nullable: true })
  relation: string;

  @Column({ name: 'NationalCode', type: 'varchar', length: 50, nullable: true })
  nationalCode: string;

  @Column({ name: 'Phone', type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({ name: 'Description', type: 'varchar', length: 500, nullable: true })
  description: string;
}
