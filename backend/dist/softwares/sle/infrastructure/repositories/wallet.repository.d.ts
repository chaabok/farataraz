import { Repository } from 'typeorm';
import { Wallet } from '../../domain/entities/wallet.entity';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';
export declare class WalletRepository implements IWalletRepository {
    private readonly repo;
    constructor(repo: Repository<Wallet>);
    get manager(): import("typeorm").EntityManager;
    findAll(options?: any): Promise<Wallet[]>;
    findById(id: number): Promise<Wallet | null>;
    create(entity: Partial<Wallet>): Promise<Wallet>;
    update(id: number, entity: Partial<Wallet>): Promise<Wallet>;
    delete(id: number): Promise<void>;
}
