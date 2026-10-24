import { Column, Entity, OneToMany, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';

@Entity({ name: 'Role', schema: 'Iam' })
export class Role extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'RoleID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column({ unique: true })
  name: string; // e.g., 'Admin', 'Agency Manager', 'Sales Rep'

  @Column({ nullable: true })
  description: string;

  // The level this role applies to (Company, Holding, Branch, Agency)
  // Maps to EntityType enum (Company, Holding, Branch, Agency)
  @Column({ nullable: true })
  level: string; 

  @OneToMany(() => RolePermission, (rp) => rp.role, { cascade: true })
  permissions: RolePermission[];

  @OneToMany(() => UserRole, (ur) => ur.role)
  userRoles: UserRole[];
}
