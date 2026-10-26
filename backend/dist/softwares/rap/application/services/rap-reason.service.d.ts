import { DataSource } from 'typeorm';
import { IRapReasonRepository } from '../../domain/repositories/rap-reason.repository.interface';
import { CreateRapReasonDto } from '../dtos/create-rap-reason.dto';
import { UpdateRapReasonDto } from '../dtos/update-rap-reason.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
export declare class RapReasonService {
    private readonly rapReasonRepository;
    private readonly dataSource;
    private readonly idGenerationService;
    private readonly usageCheckService;
    constructor(rapReasonRepository: IRapReasonRepository, dataSource: DataSource, idGenerationService: IdGenerationService, usageCheckService: UsageCheckService);
    private isBasicInfoShared;
    create(data: CreateRapReasonDto, authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    ensureDefaultReasons(authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<void>;
    findAll(authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<import("../../domain/entities/rap-reason.entity").RapReason[]>;
    findAllTree(authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<any[]>;
    findOne(id: number, authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    update(id: number, data: UpdateRapReasonDto, authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    remove(id: number, authContext: {
        businessStructureId: number;
        companyId: number;
    }): Promise<void>;
}
