import { Wallet } from '../entities/wallet.entity';
export interface IWalletRepository {
    findAll(options?: any): Promise<Wallet[]>;
    findById(id: number): Promise<Wallet | null>;
    create(entity: Partial<Wallet>): Promise<Wallet>;
    update(id: number, entity: Partial<Wallet>): Promise<Wallet>;
    delete(id: number): Promise<void>;
    manager: any;
}
export declare const IWalletRepositoryToken = "IWalletRepositoryToken";
