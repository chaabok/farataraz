import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../../domain/entities/wallet.entity';
import { IWalletRepository } from '../../domain/repositories/wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repo: Repository<Wallet>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<Wallet[]> {
    return this.repo.find({ ...options });
  }

  async findById(id: number): Promise<Wallet | null> {
    return this.repo.findOne({
      where: { WalletID: id } as any,
    });
  }

  async create(entity: Partial<Wallet>): Promise<Wallet> {
    const created = this.repo.create(entity);
    return this.repo.save(created);
  }

  async update(id: number, entity: Partial<Wallet>): Promise<Wallet> {
    await this.repo.update(id, entity as any);
    const updated = await this.findById(id);
    if (!updated) throw new Error(`Wallet with ID ${id} not found after update`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
