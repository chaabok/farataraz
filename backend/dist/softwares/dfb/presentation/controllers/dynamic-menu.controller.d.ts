import { DynamicFormService } from '../../application/services/dynamic-form.service';
export declare class DynamicMenuController {
    private readonly service;
    constructor(service: DynamicFormService);
    getMenus(companyId?: string): Promise<{
        data: {
            customMainMenus: {
                id: any;
                title: any;
                titleEn: any;
                groupId: any;
                priority: any;
                icon: any;
                color: any;
            }[];
            customSubMenus: {
                id: any;
                groupId: any;
                menuTitle: any;
                title: any;
                titleEn: any;
                icon: any;
                priority: any;
            }[];
            hiddenMenus: any[];
        };
    }>;
    syncMenus(dto: {
        customMainMenus?: any[];
        customSubMenus?: any[];
        hiddenMenus?: string[];
    }, companyId?: string): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        message: string;
        success?: undefined;
    }>;
    deleteMenuKey(key: string): Promise<{
        message: string;
    }>;
}
