import { Repository } from 'typeorm';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { IRecieptAndPaymentAccountingSettingRepository } from '../../domain/repositories/reciept-and-payment-accounting-setting.repository.interface';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class RecieptAndPaymentAccountingSettingRepository implements IRecieptAndPaymentAccountingSettingRepository {
    private readonly repository;
    private readonly requestContextService;
    constructor(repository: Repository<RecieptAndPaymentAccountingSetting>, requestContextService: RequestContextService);
    private getScope;
    create(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting>;
    update(entity: RecieptAndPaymentAccountingSetting): Promise<RecieptAndPaymentAccountingSetting>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<RecieptAndPaymentAccountingSetting | null>;
    findAll(options?: any): Promise<{
        items: RecieptAndPaymentAccountingSetting[];
        total: number;
    }>;
    findByCode(code: string): Promise<RecieptAndPaymentAccountingSetting | null>;
    calculateNextCode(businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
}
