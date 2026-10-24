import { Column, Entity, OneToMany, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { UserGroupPermission } from './user-group-permission.entity';
import { User } from './user.entity';

@Entity({ name: 'UserGroups', schema: 'Iam' })
export class UserGroup extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'UserGroupID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column()
  code: string;

  @Column()
  title: string;

  @Column({ name: 'Title_En', nullable: true })
  titleEn: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserGroupPermission, (ugp) => ugp.userGroup, { cascade: true })
  permissions: UserGroupPermission[];

  @OneToMany(() => User, (u) => u.userGroup)
  users: User[];
}
