import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'UserRole', schema: 'Iam' })
export class UserRole extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'UserRoleID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @ManyToOne(() => User, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UserID' })
  user: User;

  @Column({ name: 'UserID', type: 'bigint' })
  userId: number;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'RoleID' })
  role: Role;

  @Column({ name: 'RoleID', type: 'bigint' })
  roleId: number;
}
