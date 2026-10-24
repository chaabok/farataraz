import { Entity, Column, PrimaryColumn } from 'typeorm';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';

@Entity({ schema: 'Dfb', name: 'DynamicMenu' })
export class DynamicMenu extends AppBaseEntity {
  @PrimaryColumn({ type: 'bigint', name: 'DynamicMenuID' })
  dynamicMenuId: number;

  @Column({ type: 'varchar', name: 'MenuType', length: 50 })
  menuType: string; // 'main', 'sub', 'hidden'

  @Column({ type: 'varchar', name: 'MenuKey', length: 150 })
  menuKey: string;

  @Column({ type: 'varchar', name: 'GroupId', length: 100, nullable: true })
  groupId: string;

  @Column({ type: 'varchar', name: 'MenuTitle', length: 255, nullable: true })
  menuTitle: string;

  @Column({ type: 'varchar', name: 'Title', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', name: 'TitleEn', length: 255, nullable: true })
  titleEn: string;

  @Column({ type: 'varchar', name: 'Icon', length: 100, nullable: true })
  icon: string;

  @Column({ type: 'varchar', name: 'Color', length: 50, nullable: true })
  color: string;

  @Column({ type: 'integer', name: 'Priority', nullable: true, default: 0 })
  priority: number;

  @Column({ type: 'jsonb', name: 'Config', nullable: true, default: '{}' })
  config: any;

  @Column({ type: 'boolean', name: 'IsActive', default: true })
  isActive: boolean;
}
