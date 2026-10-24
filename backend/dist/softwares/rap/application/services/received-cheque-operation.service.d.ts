import { IReceivedChequeOperationRepository } from '../../domain/repositories/received-cheque-operation.repository.interface';
import { CreateReceivedChequeOperationDto } from '../dtos/create-received-cheque-operation.dto';
import { UpdateReceivedChequeOperationDto } from '../dtos/update-received-cheque-operation.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { ReceivedChequeOperation } from '../../domain/entities/received-cheque-operation.entity';
export declare class ReceivedChequeOperationService {
    private readonly repo;
    private readonly requestContext;
    private readonly idGenService;
    private readonly autoVoucherService;
    constructor(repo: IReceivedChequeOperationRepository, requestContext: RequestContextService, idGenService: IdGenerationService, autoVoucherService: AutoVoucherService);
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    create(dto: CreateReceivedChequeOperationDto): Promise<ReceivedChequeOperation>;
    update(id: number, dto: UpdateReceivedChequeOperationDto): Promise<ReceivedChequeOperation>;
    delete(id: number): Promise<void>;
    findById(id: number): Promise<ReceivedChequeOperation>;
    findAll(filters: any): Promise<[ReceivedChequeOperation[], number]>;
}
