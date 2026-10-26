import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BusinessStructureType } from './business-structure.enum';
export declare class BusinessStructure extends AppBaseEntity {
    businessStructureId: number;
    parentRef: number;
    code: string;
    title: string;
    title_en: string;
    businessStructure: BusinessStructureType;
    businessStructureName: string;
    manager: string;
    isActive: boolean;
    isSystem: boolean;
    logoUrl: string;
    isBasicInfoShared: boolean;
    activeStructureTypes: string;
    businessStructureEntity?: any;
    companyEntity?: any;
    branchEntity?: any;
    agencyEntity?: any;
}
