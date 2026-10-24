import { GeoLocation } from '../entities/geo-location.entity';
export interface IGeoLocationRepository {
    findAll(): Promise<GeoLocation[]>;
    findById(id: number): Promise<GeoLocation | null>;
    findByCode(code: string): Promise<GeoLocation | null>;
    create(geoLocation: GeoLocation): Promise<GeoLocation>;
    update(id: number, geoLocation: Partial<GeoLocation>): Promise<GeoLocation>;
    delete(id: number): Promise<void>;
    countChildren(parentId: number): Promise<number>;
}
export declare const IGeoLocationRepository: unique symbol;
