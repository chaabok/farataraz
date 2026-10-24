import { Repository } from 'typeorm';
import { Party } from '../../domain/entities/party.entity';
import { IPartyRepository } from '../../domain/repositories/party.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class PartyRepository implements IPartyRepository {
    private readonly repository;
    private readonly requestContextService;
    private readonly baseSettingsService;
    private readonly idGenerationService;
    constructor(repository: Repository<Party>, requestContextService: RequestContextService, baseSettingsService: BaseSettingsService, idGenerationService: IdGenerationService);
    private getScope;
    create(data: Partial<Party>): Promise<Party>;
    update(id: number, data: Partial<Party>): Promise<Party>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<Party | null>;
    findAll(options?: any): Promise<Party[]>;
    findAdvanced(params: any): Promise<[Party[], number]>;
    private mapDetailedAccountKeys;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    findDuplicatesByFullName(firstName: string, lastName: string, excludeId?: number): Promise<boolean>;
}
