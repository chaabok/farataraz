import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ICashierRepository } from '../../domain/repositories/cashier.repository.interface';
import { Cashier } from '../../domain/entities/cashier.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class CashierRepository implements ICashierRepository {
  constructor(
    @InjectRepository(Cashier)
    private readonly typeOrmRepo: Repository<Cashier>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.typeOrmRepo.manager.query(
        `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`,
        [bsId]
      );
      if (rows && rows.length > 0) {
        if (rows.some((r: any) => {
          const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
          return val === false || val === 0 || val === 'false' || val === null;
        })) {
          isShared = false;
        }
      } else {
        isShared = false;
      }
    } catch (err) {
      isShared = false;
    }

    return { bsId, compId, isShared };
  }

  async create(data: Partial<Cashier>): Promise<Cashier> {
    if (!data.cashierId) {
      data.cashierId = await this.idGenService.generateNextId('Cashiers');
    }
    const { bsId, compId } = await this.getScope();
    const item = this.typeOrmRepo.create({
      ...data,
      businessStructureRef: (data.businessStructureRef && data.businessStructureRef > 1) ? data.businessStructureRef : bsId,
      companyRef: (data.companyRef && data.companyRef > 1) ? data.companyRef : compId,
    });
    return this.typeOrmRepo.save(item);
  }

  async update(id: number, data: Partial<Cashier>): Promise<Cashier> {
    await this.typeOrmRepo.update(id, data);
    return this.findById(id) as Promise<Cashier>;
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async findById(id: number): Promise<Cashier | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { cashierId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.findOne({ where, relations: ['user', 'cash'] });
  }

  async findByCashId(cashId: number): Promise<Cashier[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { cashId };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.typeOrmRepo.find({ where, relations: ['user'] });
  }
}
