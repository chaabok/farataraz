import { Column, Entity, ManyToOne, JoinColumn, OneToMany, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { BusinessStructure } from '../../../softwares/common/domain/entities/business-structure.entity';
import { UserRole } from './user-role.entity';
import { UserGroup } from './user-group.entity';

@Entity({ name: 'User', schema: 'Iam' })
export class User extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'UserID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true, default: 0 })
  repeatChangePassword: number; // 0: No change, 1: Every 3 months, 2: Every year

  // The organization level this user belongs to
  @ManyToOne(() => BusinessStructure, { nullable: true })
  @JoinColumn({ name: 'BusinessStructureID' })
  businessStructure: BusinessStructure;

  @Column({ name: 'BusinessStructureID', type: 'bigint', nullable: true })
  businessStructureId: number;

  @OneToMany(() => UserRole, (ur) => ur.user, { cascade: true })
  roles: UserRole[];

  @ManyToOne(() => UserGroup, (ug) => ug.users, { nullable: true })
  @JoinColumn({ name: 'UserGroupRef' })
  userGroup: UserGroup;

  @Column({ name: 'UserGroupRef', type: 'bigint', nullable: true })
  userGroupRef: number;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSeen: Date;

  @Column({ nullable: true })
  twoFactorSecret: string;

  @Column({ default: false })
  isTwoFactorEnabled: boolean;
}
