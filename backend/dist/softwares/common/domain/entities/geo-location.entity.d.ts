import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { GeographicType } from './geographic-type.enum';
export declare class GeoLocation extends AppBaseEntity {
    geolocationId: number;
    parentRef: number;
    geographicType: GeographicType;
    code: string;
    title: string;
    titleEn: string;
    isActive: boolean;
}
