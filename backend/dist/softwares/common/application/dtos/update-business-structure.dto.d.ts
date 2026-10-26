import { BusinessStructureType } from '../../domain/entities/business-structure.enum';
export declare class UpdateBusinessStructureDto {
    parentRef?: number;
    code?: string;
    title?: string;
    title_en?: string;
    businessStructure?: BusinessStructureType;
    businessStructureName?: string;
    manager?: string;
    isActive?: boolean;
    logoUrl?: string;
    isBasicInfoShared?: boolean;
    activeStructureTypes?: string;
}
