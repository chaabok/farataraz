import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { User } from './user.entity';

@Entity({ schema: 'Iam', name: 'BusinessStructureUsers' })
export class BusinessStructureUsers extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint',
    //@ts-ignore
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  businessStructureUsersId: number;

  @Column({ 
    name: 'UserRef', 
    type: 'bigint', 
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  userRef: number;

  @Column({ 
    name: 'BusinessStructureRef', 
    type: 'bigint', 
    nullable: false,
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
  businessStructureRef: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'UserRef' })
  user: User;
}
