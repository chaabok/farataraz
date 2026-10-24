import { IRecieptAndPaymentAccountingSettingRepository } from '../../domain/repositories/reciept-and-payment-accounting-setting.repository.interface';
import { CreateRecieptAndPaymentAccountingSettingDto } from '../dtos/create-reciept-and-payment-accounting-setting.dto';
import { UpdateRecieptAndPaymentAccountingSettingDto } from '../dtos/update-reciept-and-payment-accounting-setting.dto';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { DataSource } from 'typeorm';
export declare class RecieptAndPaymentAccountingSettingService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    private readonly dataSource;
    constructor(repository: IRecieptAndPaymentAccountingSettingRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService, dataSource: DataSource);
    private isBasicInfoShared;
    getNextNumber(): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error?: string;
    }>;
    create(createDto: CreateRecieptAndPaymentAccountingSettingDto): Promise<RecieptAndPaymentAccountingSetting>;
    update(id: number, updateDto: UpdateRecieptAndPaymentAccountingSettingDto): Promise<RecieptAndPaymentAccountingSetting>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<RecieptAndPaymentAccountingSetting>;
    findAll(options?: any): Promise<{
        items: RecieptAndPaymentAccountingSetting[];
        total: number;
    }>;
}
