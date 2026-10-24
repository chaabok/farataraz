import { RapReasonService } from '../../application/services/rap-reason.service';
import { CreateRapReasonDto } from '../../application/dtos/create-rap-reason.dto';
import { UpdateRapReasonDto } from '../../application/dtos/update-rap-reason.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class RapReasonController {
    private readonly rapReasonService;
    private readonly requestContextService;
    constructor(rapReasonService: RapReasonService, requestContextService: RequestContextService);
    create(createDto: CreateRapReasonDto): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    findAll(): Promise<import("../../domain/entities/rap-reason.entity").RapReason[]>;
    findTree(): Promise<any[]>;
    findOne(id: number): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    update(id: number, updateDto: UpdateRapReasonDto): Promise<import("../../domain/entities/rap-reason.entity").RapReason>;
    remove(id: number): Promise<void>;
}
