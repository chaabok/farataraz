import { WalletService } from '../../application/services/wallet.service';
import { CreateWalletDto, UpdateWalletDto } from '../../application/dtos/create-wallet.dto';
export declare class WalletController {
    private readonly service;
    constructor(service: WalletService);
    findAll(): Promise<{
        data: import("../../domain/entities/wallet.entity").Wallet[];
        success: boolean;
    }>;
    getNextNumber(): Promise<{
        data: {
            documentNumber: number;
            isDocumentNumberAuto: boolean;
        };
        success: boolean;
    }>;
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        data: {
            isDuplicate: boolean;
        };
        success: boolean;
    }>;
    create(dto: CreateWalletDto): Promise<{
        data: import("../../domain/entities/wallet.entity").Wallet;
        success: boolean;
        message: string;
    }>;
    update(id: string, dto: UpdateWalletDto): Promise<{
        data: import("../../domain/entities/wallet.entity").Wallet;
        success: boolean;
        message: string;
    }>;
    findOne(id: string): Promise<{
        data: import("../../domain/entities/wallet.entity").Wallet;
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
