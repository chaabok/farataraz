import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardItemRate } from '../../domain/entities/standard-item-rate.entity';
import { IStandardItemRateRepository } from '../../domain/repositories/standard-item-rate.repository.interface';

@Injectable()
export class StandardItemRateRepository implements IStandardItemRateRepository {
  constructor(
    @InjectRepository(StandardItemRate)
    private readonly repository: Repository<StandardItemRate>,
  ) {}

  get manager() {
    return this.repository.manager;
  }
}
