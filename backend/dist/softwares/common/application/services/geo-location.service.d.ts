import { IGeoLocationRepository } from '../../domain/repositories/geo-location.repository.interface';
import { CreateGeoLocationDto } from '../dtos/create-geo-location.dto';
import { UpdateGeoLocationDto } from '../dtos/update-geo-location.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { GeoLocation } from '../../domain/entities/geo-location.entity';
export declare class GeoLocationService {
    private readonly repository;
    private readonly idGenerationService;
    constructor(repository: IGeoLocationRepository, idGenerationService: IdGenerationService);
    findAll(): Promise<GeoLocation[]>;
    findAllCitiesFlattened(): Promise<{
        id: number;
        code: string;
        title: string;
        latinTitle: string;
        province: string;
        country: string;
    }[]>;
    findById(id: number): Promise<GeoLocation>;
    create(dto: CreateGeoLocationDto): Promise<GeoLocation>;
    update(id: number, dto: UpdateGeoLocationDto): Promise<GeoLocation>;
    delete(id: number): Promise<{
        success: boolean;
    }>;
}
