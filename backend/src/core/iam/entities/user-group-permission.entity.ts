import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { UserGroup } from './user-group.entity';

@Entity({ name: 'UserGroupPermissions', schema: 'Iam' })
export class UserGroupPermission extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'UserGroupPermissionsID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @ManyToOne(() => UserGroup, (ug) => ug.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserGroupRef' })
  userGroup: UserGroup;

  @Column({ name: 'UserGroupRef', type: 'bigint' })
  userGroupRef: number;

  @Column()
  permissionKey: string;

  @Column({ default: true })
  value: boolean;
}
