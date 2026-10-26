import { EntityNumberingService } from '../../application/services/entity-numbering.service';
import { FiscalYearService } from '../../application/services/fiscal-year.service';
import { EntityNumbering } from '../../domain/entities/entity-numbering.entity';
export declare class EntityNumberingController {
    private readonly service;
    private readonly fiscalYearService;
    constructor(service: EntityNumberingService, fiscalYearService: FiscalYearService);
    findAll(search?: string): Promise<{
        data: {
            entityTitle: string;
            title: string;
            entityNumberingId: number;
            entityRef: string;
            numberingMethod: string;
            numberingType: string;
            baseNumbering: string[];
            items: any;
            version: number;
            creator: number;
            creationDate: Date;
            createTime: string;
            lastModifier: number;
            lastModificationDate: Date;
            lastModificationTime: string;
            businessStructureRef: number;
            businessStructureEntity?: any;
            companyRef?: number;
            companyEntity?: any;
            branchRef?: number;
            branchEntity?: any;
            agencyRef?: number;
            agencyEntity?: any;
        }[];
    }>;
    getByEntityRef(entityRef: string): Promise<{
        data: EntityNumbering;
    }>;
    saveByEntityRef(entityRef: string, body: {
        numberingMethod: string;
        numberingType: string;
        baseNumbering?: string[];
        items: any;
    }): Promise<{
        data: EntityNumbering;
        message: string;
    }>;
    deleteByEntityRef(entityRef: string): Promise<{
        message: string;
    }>;
}
