import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from './app-base.entity';

export enum ActivityAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  PRINT = 'PRINT',
  EXPORT_EXCEL = 'EXPORT_EXCEL',
  EXPORT_WORD = 'EXPORT_WORD',
  EXPORT_PDF = 'EXPORT_PDF',
  UPLOAD = 'UPLOAD',
  DOWNLOAD = 'DOWNLOAD',
  OTHER = 'OTHER'
}

@Entity({ name: 'ActivityLog', schema: 'Gnr' })
export class ActivityLog extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'Action', type: 'varchar', length: 50, nullable: false })
  action: string;

  @Column({ name: 'EntityName', type: 'varchar', length: 150, nullable: true })
  entityName: string;

  @Column({ name: 'EntityId', type: 'varchar', length: 100, nullable: true })
  entityId: string;

  @Column({ name: 'OldValues', type: 'simple-json', nullable: true })
  oldValues: any;

  @Column({ name: 'NewValues', type: 'simple-json', nullable: true })
  newValues: any;

  @Column({ name: 'IpAddress', type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ name: 'UserAgent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ name: 'Url', type: 'varchar', length: 1000, nullable: true })
  url: string;

  @Column({ name: 'Method', type: 'varchar', length: 10, nullable: true })
  method: string;
  
  @Column({ name: 'Description', type: 'text', nullable: true })
  description: string;
}
