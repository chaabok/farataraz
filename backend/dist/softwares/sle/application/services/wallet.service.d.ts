import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';
import { CreateWalletDto, UpdateWalletDto } from '../dtos/create-wallet.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class WalletService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IWalletRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<Wallet[]>;
    findById(id: number): Promise<Wallet>;
    getNextNumber(): Promise<{
        documentNumber: number;
        isDocumentNumberAuto: boolean;
    }>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    create(dto: CreateWalletDto): Promise<Wallet>;
    update(id: number, dto: UpdateWalletDto): Promise<Wallet>;
    remove(id: number): Promise<void>;
}
