import { OnModuleInit } from '@nestjs/common';
import { BusinessStructureRepository } from '../../infrastructure/repositories/business-structure.repository';
import { CreateBusinessStructureDto } from '../dtos/create-business-structure.dto';
import { UpdateBusinessStructureDto } from '../dtos/update-business-structure.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { SeedInitializerService } from './seed-initializer.service';
export declare class BusinessStructureService implements OnModuleInit {
    private readonly repository;
    private readonly idGenerationService;
    private readonly seedInitializerService;
    constructor(repository: BusinessStructureRepository, idGenerationService: IdGenerationService, seedInitializerService: SeedInitializerService);
    onModuleInit(): Promise<void>;
    seedDefaults(): Promise<void>;
    create(dto: CreateBusinessStructureDto, companyId?: number): Promise<BusinessStructure>;
    findAll(): Promise<BusinessStructure[]>;
    findById(id: number): Promise<BusinessStructure | null>;
    updateAllSharing(isShared: boolean): Promise<void>;
    update(id: number, dto: UpdateBusinessStructureDto, companyId?: number): Promise<BusinessStructure>;
    delete(id: number): Promise<void>;
}
