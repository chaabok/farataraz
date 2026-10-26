import { GeoLocationService } from '../../application/services/geo-location.service';
import { CreateGeoLocationDto } from '../../application/dtos/create-geo-location.dto';
import { UpdateGeoLocationDto } from '../../application/dtos/update-geo-location.dto';
export declare class GeoLocationController {
    private readonly service;
    constructor(service: GeoLocationService);
    findAll(): Promise<{
        data: import("../../domain/entities/geo-location.entity").GeoLocation[];
    }>;
    getCities(): Promise<{
        data: {
            id: number;
            code: string;
            title: string;
            latinTitle: string;
            province: string;
            country: string;
        }[];
    }>;
    findOne(id: number): Promise<{
        data: import("../../domain/entities/geo-location.entity").GeoLocation;
    }>;
    create(dto: CreateGeoLocationDto): Promise<{
        data: import("../../domain/entities/geo-location.entity").GeoLocation;
        message: string;
    }>;
    update(id: number, dto: UpdateGeoLocationDto): Promise<{
        data: import("../../domain/entities/geo-location.entity").GeoLocation;
        message: string;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
