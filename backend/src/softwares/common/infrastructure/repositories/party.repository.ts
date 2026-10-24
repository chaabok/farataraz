import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Party } from '../../domain/entities/party.entity';
import { IPartyRepository } from '../../domain/repositories/party.repository.interface';
import { applyDataGridParams, QueryParams } from '../../../../core/utils/typeorm-query-builder';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';
import { BusinessStructure } from '../../domain/entities/business-structure.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class PartyRepository implements IPartyRepository {
  constructor(
    @InjectRepository(Party)
    private readonly repository: Repository<Party>,
    private readonly requestContextService: RequestContextService,
    @Inject(forwardRef(() => BaseSettingsService))
    private readonly baseSettingsService: BaseSettingsService,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.repository.manager.query(
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

  async create(data: Partial<Party>): Promise<Party> {
    const { bsId, compId } = await this.getScope();
    const partyId = await this.idGenerationService.generateNextId('Party');

    if (data.partyRelatedPersons && data.partyRelatedPersons.length > 0) {
      for (const related of data.partyRelatedPersons) {
        if (!related.partyRelatedId) {
          related.partyRelatedId = await this.idGenerationService.generateNextId('PartyRelated');
        }
      }
    }

    const addresses = data.partyAddresses || (data as any).PartyAddresses;
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        if (!addr.partyAddressId && !addr.PartyAddressID) {
          addr.partyAddressId = await this.idGenerationService.generateNextId('PartyAddress');
        } else if (addr.PartyAddressID && !addr.partyAddressId) {
          addr.partyAddressId = addr.PartyAddressID;
        }
      }
      data.partyAddresses = addresses;
      delete (data as any).PartyAddresses;
    }

    const phones = data.partyPhones || (data as any).PartyPhones;
    if (phones && Array.isArray(phones)) {
      for (const phone of phones) {
        if (!phone.partyPhoneId && !phone.PartyPhoneID) {
          phone.partyPhoneId = await this.idGenerationService.generateNextId('PartyPhone');
        } else if (phone.PartyPhoneID && !phone.partyPhoneId) {
          phone.partyPhoneId = phone.PartyPhoneID;
        }
      }
      data.partyPhones = phones;
      delete (data as any).PartyPhones;
    }

    const entity = this.repository.create({
      ...data,
      partyId,
      businessStructureRef: bsId,
      companyRef: compId,
    });
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<Party>): Promise<Party> {
    if (data.partyRelatedPersons && data.partyRelatedPersons.length > 0) {
      for (const related of data.partyRelatedPersons) {
        if (!related.partyRelatedId) {
          related.partyRelatedId = await this.idGenerationService.generateNextId('PartyRelated');
        }
      }
    }

    const addresses = data.partyAddresses || (data as any).PartyAddresses;
    if (addresses && Array.isArray(addresses)) {
      for (const addr of addresses) {
        if (!addr.partyAddressId && !addr.PartyAddressID) {
          addr.partyAddressId = await this.idGenerationService.generateNextId('PartyAddress');
        } else if (addr.PartyAddressID && !addr.partyAddressId) {
          addr.partyAddressId = addr.PartyAddressID;
        }
      }
      data.partyAddresses = addresses;
      delete (data as any).PartyAddresses;
    }

    const phones = data.partyPhones || (data as any).PartyPhones;
    if (phones && Array.isArray(phones)) {
      for (const phone of phones) {
        if (!phone.partyPhoneId && !phone.PartyPhoneID) {
          phone.partyPhoneId = await this.idGenerationService.generateNextId('PartyPhone');
        } else if (phone.PartyPhoneID && !phone.partyPhoneId) {
          phone.partyPhoneId = phone.PartyPhoneID;
        }
      }
      data.partyPhones = phones;
      delete (data as any).PartyPhones;
    }
    
    // For nested arrays like related persons, addresses, phones, save() works better than update()
    if (data.partyRelatedPersons !== undefined || data.partyAddresses !== undefined || data.partyPhones !== undefined || (data as any).PartyAddresses !== undefined || (data as any).PartyPhones !== undefined) {
       const existingEntity = await this.findById(id);
       if (existingEntity) {
          const mergedEntity = this.repository.merge(existingEntity, data);
          await this.repository.save(mergedEntity);
          return this.findById(id) as Promise<Party>;
       }
    }

    await this.repository.update(id, data);
    return this.findById(id) as Promise<Party>;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async findById(id: number): Promise<Party | null> {
    return this.repository.findOne({ where: { partyId: id } });
  }

  async findAll(options?: any): Promise<Party[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('party');
    qb.leftJoinAndSelect('party.detailedAccount', 'da');

    if (isShared) {
      qb.where('party.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('party.companyRef = :compId', { compId });
    }

    if (options?.excludeAssignedCustomers) {
      const excludeCustId = options.excludeCustomerId ? Number(options.excludeCustomerId) : undefined;
      let subQuery = qb.subQuery()
        .select('c.PartyRef')
        .from('Sle.Customers', 'c')
        .where('c.PartyRef IS NOT NULL');
      if (excludeCustId) {
        subQuery = subQuery.andWhere('c.CustomerID != :excludeCustId', { excludeCustId });
      }
      qb.andWhere(`party.partyId NOT IN (${subQuery.getQuery()})`);
    }

    if (options?.where) {
      if (options.where.nature) {
        qb.andWhere('party.nature = :nature', { nature: options.where.nature });
      }
      if (options.where.isActive !== undefined) {
        qb.andWhere('party.isActive = :isActive', { isActive: options.where.isActive });
      }
      if (options.where.isCustomer !== undefined) {
        qb.andWhere('party.isCustomer = :isCustomer', { isCustomer: options.where.isCustomer });
      }
      if (options.where.isSupplier !== undefined) {
        qb.andWhere('party.isSupplier = :isSupplier', { isSupplier: options.where.isSupplier });
      }
    }

    return qb.getMany();
  }

  async findAdvanced(params: any): Promise<[Party[], number]> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('party');
    
    // Explicitly join eager relation when using QueryBuilder
    qb.leftJoinAndSelect('party.detailedAccount', 'da');

    if (isShared) {
      qb.where('party.businessStructureRef = :bsId', { bsId });
    } else {
      qb.where('party.companyRef = :compId', { compId });
    }

    if (params.excludeAssignedCustomers) {
      const excludeCustId = params.excludeCustomerId ? Number(params.excludeCustomerId) : undefined;
      let subQuery = qb.subQuery()
        .select('c.PartyRef')
        .from('Sle.Customers', 'c')
        .where('c.PartyRef IS NOT NULL');
      if (excludeCustId) {
        subQuery = subQuery.andWhere('c.CustomerID != :excludeCustId', { excludeCustId });
      }
      qb.andWhere(`party.partyId NOT IN (${subQuery.getQuery()})`);
    }
    
    applyDataGridParams(qb, params, 'party');
    
    return qb.getManyAndCount();
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('party');
    
    // For general fields
    qb.where(`party.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('party.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('party.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('party.partyId != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async findDuplicatesByFullName(firstName: string, lastName: string, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const qb = this.repository.createQueryBuilder('party');
    qb.where('party.firstName = :firstName', { firstName })
      .andWhere('party.lastName = :lastName', { lastName });

    if (isShared) {
      qb.andWhere('party.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('party.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('party.partyId != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }

    const count = await qb.getCount();
    return count > 0;
  }
}