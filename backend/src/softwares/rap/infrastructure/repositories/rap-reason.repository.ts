import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRapReasonRepository } from '../../domain/repositories/rap-reason.repository.interface';
import { RapReason } from '../../domain/entities/rap-reason.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';

@Injectable()
export class RapReasonRepository implements IRapReasonRepository {
  constructor(
    @InjectRepository(RapReason)
    private readonly repository: Repository<RapReason>,
  ) {}

  async create(data: Partial<RapReason>): Promise<RapReason> {
    const newReason = this.repository.create(data);
    return await this.repository.save(newReason);
  }

  async findAll(authContext: { businessStructureId: number; companyId: number }, isBasicInfoShared: boolean): Promise<RapReason[]> {
    const qb = this.repository.createQueryBuilder('entity');
    qb.leftJoinAndMapOne('entity.AccountObj', Account, 'account', 'entity.AccountRef = account.id');

    if (isBasicInfoShared) {
      qb.where('entity.businessStructureRef = :bsId', { bsId: authContext.businessStructureId });
    } else {
      qb.where('entity.companyRef = :cId', { cId: authContext.companyId });
    }
    return await qb.orderBy('entity.RapReasonID', 'ASC').getMany();
  }

  async findById(id: number, authContext: { businessStructureId: number; companyId: number }, isBasicInfoShared: boolean): Promise<RapReason | null> {
    const qb = this.repository.createQueryBuilder('entity');
    qb.leftJoinAndMapOne('entity.AccountObj', Account, 'account', 'entity.AccountRef = account.id');

    qb.where('entity.RapReasonID = :id', { id });
    if (isBasicInfoShared) {
      qb.andWhere('entity.businessStructureRef = :bsId', { bsId: authContext.businessStructureId });
    } else {
      qb.andWhere('entity.companyRef = :cId', { cId: authContext.companyId });
    }
    return await qb.getOne();
  }

  async update(id: number, data: Partial<RapReason>): Promise<RapReason> {
    await this.repository.update({ RapReasonID: id }, data);
    return (await this.repository.findOne({ where: { RapReasonID: id } }))!;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ RapReasonID: id });
  }
}
