import { Column, Entity, OneToMany, PrimaryColumn , Generated} from 'typeorm';
import { AppBaseEntity } from '../../entities/app-base.entity';
import { RolePermission } from './role-permission.entity';

@Entity({ name: 'Permission', schema: 'Iam' })
export class Permission extends AppBaseEntity {
  @PrimaryColumn({ 
    type: 'bigint', 
    name: 'PermissionID',
    transformer: {
      to: (value: number) => value,
      from: (value: any) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
    }
  })
    id: number;

  @Column()
  resource: string; // e.g., 'SalesInvoice', 'Customer', 'DocumentType'

  @Column()
  action: string; // e.g., 'create', 'read', 'update', 'delete', 'print', 'export'

  @Column({ nullable: true })
  description: string;

  // Indicates if this permission is auto-discovered
  @Column({ default: true })
  isAutoDiscovered: boolean;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];
}
