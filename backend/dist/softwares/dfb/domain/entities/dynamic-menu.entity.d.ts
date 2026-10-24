import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class DynamicMenu extends AppBaseEntity {
    dynamicMenuId: number;
    menuType: string;
    menuKey: string;
    groupId: string;
    menuTitle: string;
    title: string;
    titleEn: string;
    icon: string;
    color: string;
    priority: number;
    config: any;
    isActive: boolean;
}
