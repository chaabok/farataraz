import { GeographicType } from '../../domain/entities/geographic-type.enum';
export declare class CreateGeoLocationDto {
    parentRef?: number;
    geographicType: GeographicType;
    code: string;
    title: string;
    titleEn: string;
    isActive?: boolean;
}
