import { Repository } from 'typeorm';
import { GeoLocation } from '../../domain/entities/geo-location.entity';
import { IGeoLocationRepository } from '../../domain/repositories/geo-location.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class GeoLocationRepository implements IGeoLocationRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<GeoLocation>, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<GeoLocation[]>;
    findById(id: number): Promise<GeoLocation | null>;
    findByCode(code: string): Promise<GeoLocation | null>;
    create(geoLocation: GeoLocation): Promise<GeoLocation>;
    update(id: number, updateData: Partial<GeoLocation>): Promise<GeoLocation>;
    delete(id: number): Promise<void>;
    countChildren(parentId: number): Promise<number>;
}
