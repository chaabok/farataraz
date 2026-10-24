import { Column, Entity, ManyToOne, JoinColumn, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity({ name: 'RolePermission', schema: 'Iam' })
export class RolePermission extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'RolePermissionID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @ManyToOne(() => Role, (role) => role.permissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'RoleID' })
  role: Role;

  @Column({ name: 'RoleID', type: 'bigint' })
  roleId: number;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'PermissionID' })
  permission: Permission;

  @Column({ name: 'PermissionID', type: 'bigint' })
  permissionId: number;

  // For ABAC/Row-Level Security: Conditions in JSON format
  // e.g. { "businessStructureId": "{user.businessStructureId}" }
  @Column({ type: 'simple-json', nullable: true })
  conditions: Record<string, any>;
}
