import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class DynamicForm extends AppBaseEntity {
    dynamicFormId: number;
    formCode: string;
    title: string;
    description: string;
    componentName: string;
    bands: any[];
    fields: any[];
    styles: any;
    menuConfig: any;
    options: any;
    showPrintList: boolean;
    showVoucherActionbar: boolean;
    isActive: boolean;
}
