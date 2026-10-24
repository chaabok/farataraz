import { Repository } from 'typeorm';
import { IRapReasonRepository } from '../../domain/repositories/rap-reason.repository.interface';
import { RapReason } from '../../domain/entities/rap-reason.entity';
export declare class RapReasonRepository implements IRapReasonRepository {
    private readonly repository;
    constructor(repository: Repository<RapReason>);
    create(data: Partial<RapReason>): Promise<RapReason>;
    findAll(authContext: {
        businessStructureId: number;
        companyId: number;
    }, isBasicInfoShared: boolean): Promise<RapReason[]>;
    findById(id: number, authContext: {
        businessStructureId: number;
        companyId: number;
    }, isBasicInfoShared: boolean): Promise<RapReason | null>;
    update(id: number, data: Partial<RapReason>): Promise<RapReason>;
    delete(id: number): Promise<void>;
}
