import { IDynamicFormRepository } from '../../domain/repositories/dynamic-form.repository.interface';
import { IDynamicFormRecordRepository } from '../../domain/repositories/dynamic-form-record.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { DynamicForm } from '../../domain/entities/dynamic-form.entity';
import { DynamicFormRecord } from '../../domain/entities/dynamic-form-record.entity';
export declare class DynamicFormService {
    private readonly repo;
    private readonly recordRepo;
    private readonly idGen;
    private readonly requestContext;
    constructor(repo: IDynamicFormRepository, recordRepo: IDynamicFormRecordRepository, idGen: IdGenerationService, requestContext: RequestContextService);
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
    }, companyId: number): Promise<DynamicForm>;
    private ensureDatabaseTableCreated;
    findAll(): Promise<DynamicForm[]>;
    findOne(id: number): Promise<DynamicForm>;
    findByCode(code: string, companyId: number): Promise<DynamicForm>;
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
    }, companyId: number): Promise<DynamicForm>;
    remove(id: number): Promise<void>;
    createRecord(formId: number, data: Record<string, any>, companyId: number): Promise<DynamicFormRecord>;
    findRecordOne(id: number): Promise<DynamicFormRecord>;
    findAllRecordsByForm(formId: number, companyId: number): Promise<DynamicFormRecord[]>;
    updateRecord(id: number, data: Record<string, any>, companyId: number): Promise<DynamicFormRecord>;
    removeRecord(id: number): Promise<void>;
    private menuTableEnsured;
    private ensureDynamicMenuTableCreated;
    getMenus(companyId: number): Promise<{
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
    }>;
    syncMenus(body: {
        customMainMenus?: any[];
        customSubMenus?: any[];
        hiddenMenus?: string[];
    }, companyId: number): Promise<{
        success: boolean;
        message?: undefined;
    } | {
        message: string;
        success?: undefined;
    }>;
    deleteMenuByKey(menuKey: string): Promise<{
        message: string;
    }>;
}
