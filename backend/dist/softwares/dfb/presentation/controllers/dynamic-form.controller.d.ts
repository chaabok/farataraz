import { DynamicFormService } from '../../application/services/dynamic-form.service';
export declare class DynamicFormController {
    private readonly service;
    constructor(service: DynamicFormService);
    create(dto: {
        formCode: string;
        title: string;
        description?: string;
        componentName?: string;
        bands?: any[];
        fields?: any[];
        styles?: any;
        menuConfig?: any;
        options?: any;
        showPrintList?: boolean;
        showVoucherActionbar?: boolean;
        isActive?: boolean;
    }, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form.entity").DynamicForm;
        message: string;
    }>;
    findAll(): Promise<{
        data: import("../../domain/entities/dynamic-form.entity").DynamicForm[];
    }>;
    findByCode(code: string, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form.entity").DynamicForm;
    }>;
    findOne(id: number): Promise<{
        data: import("../../domain/entities/dynamic-form.entity").DynamicForm;
    }>;
    update(id: number, dto: {
        formCode?: string;
        title?: string;
        description?: string;
        componentName?: string;
        bands?: any[];
        fields?: any[];
        styles?: any;
        menuConfig?: any;
        options?: any;
        showPrintList?: boolean;
        showVoucherActionbar?: boolean;
        isActive?: boolean;
    }, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form.entity").DynamicForm;
        message: string;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    createRecord(formId: number, dataDto: Record<string, any>, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form-record.entity").DynamicFormRecord;
        message: string;
    }>;
    findAllRecords(formId: number, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form-record.entity").DynamicFormRecord[];
    }>;
    findRecordOne(recordId: number): Promise<{
        data: import("../../domain/entities/dynamic-form-record.entity").DynamicFormRecord;
    }>;
    updateRecord(recordId: number, dataDto: Record<string, any>, companyId?: string): Promise<{
        data: import("../../domain/entities/dynamic-form-record.entity").DynamicFormRecord;
        message: string;
    }>;
    removeRecord(recordId: number): Promise<{
        message: string;
    }>;
}
