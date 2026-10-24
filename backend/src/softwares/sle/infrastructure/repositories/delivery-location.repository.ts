import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryLocation } from '../../domain/entities/delivery-location.entity';
import { IDeliveryLocationRepository } from '../../domain/repositories/delivery-location.repository.interface';

@Injectable()
export class DeliveryLocationRepository implements IDeliveryLocationRepository {
  constructor(
    @InjectRepository(DeliveryLocation)
    private readonly repo: Repository<DeliveryLocation>,
  ) {}

  get manager() {
    return this.repo.manager;
  }

  async findAll(options?: any): Promise<DeliveryLocation[]> {
    return this.repo.find(options);
  }

  async findById(id: number): Promise<DeliveryLocation | null> {
    return this.repo.findOne({ where: { DeliveryLocationID: id } as any });
  }

  async create(entity: DeliveryLocation): Promise<DeliveryLocation> {
    return this.repo.save(entity);
  }

  async update(id: number, attrs: Partial<DeliveryLocation>): Promise<DeliveryLocation> {
    await this.repo.update(id, attrs);
    return this.findById(id) as Promise<DeliveryLocation>;
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
