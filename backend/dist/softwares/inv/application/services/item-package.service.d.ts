import { Repository } from 'typeorm';
import { ItemPackage } from '../../domain/entities/item-package.entity';
import { ItemPackageDetail } from '../../domain/entities/item-package-detail.entity';
import { CreateItemPackageDto, UpdateItemPackageDto } from '../dtos/item-package.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemPackageService {
    private readonly repository;
    private readonly detailRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ItemPackage>, detailRepository: Repository<ItemPackageDetail>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    private parseRef;
    getNextNumber(): Promise<{
        packageCode: string;
    }>;
    create(dto: CreateItemPackageDto): Promise<ItemPackage>;
    findAll(query?: any): Promise<ItemPackage[]>;
    findOne(id: number): Promise<ItemPackage>;
    update(id: number, dto: UpdateItemPackageDto): Promise<ItemPackage>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
