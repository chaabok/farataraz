import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { Account } from '../../domain/entities/account.entity';
import { AccountsRelatedDetailedAccount } from '../../domain/entities/accounts-related-detailed-account.entity';
import { AccountsNatureAdjusting } from '../../domain/entities/accounts-nature-adjusting.entity';
import { AccountsVoucherDecriptions } from '../../domain/entities/accounts-voucher-decriptions.entity';
import { IAccountRepository } from '../../domain/repositories/account.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BusinessStructure } from '../../../common/domain/entities/business-structure.entity';
import { BaseSettings } from '../../../common/domain/entities/base-settings.entity';

@Injectable()
export class AccountRepository implements IAccountRepository {
  constructor(
    @InjectRepository(Account)
    private readonly typeOrmRepo: Repository<Account>,
    private readonly idGenerationService: IdGenerationService,
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

  async create(data: Partial<Account>): Promise<Account> {
    const { bsId, compId } = await this.getScope();
    const manualId = data.id;
    const nextId = manualId || await this.idGenerationService.generateNextId('Account');
    const newEntity = this.typeOrmRepo.create({ 
      ...data, 
      id: nextId,
      businessStructureRef: bsId,
      companyRef: compId
    });

    // Make sure id is propagated to related entities and generate primary keys if missing
    if (newEntity.relatedDetailedAccounts && newEntity.relatedDetailedAccounts.length > 0) {
      const count = newEntity.relatedDetailedAccounts.length;
      const startId = await this.idGenerationService.generateNextIdBlock('AccountsRelatedDetailedAccount', count);
      newEntity.relatedDetailedAccounts.forEach((r, idx) => {
        r.accountId = nextId;
        if (!r.id) {
          r.id = startId + idx;
        }
      });
    }
    if (newEntity.natureAdjustments && newEntity.natureAdjustments.length > 0) {
      const count = newEntity.natureAdjustments.length;
      const startId = await this.idGenerationService.generateNextIdBlock('AccountsNatureAdjusting', count);
      newEntity.natureAdjustments.forEach((r, idx) => {
        r.accountId = nextId;
        if (!r.id) {
          r.id = startId + idx;
        }
      });
    }
    if (newEntity.frequentDescriptions && newEntity.frequentDescriptions.length > 0) {
      const count = newEntity.frequentDescriptions.length;
      const startId = await this.idGenerationService.generateNextIdBlock('AccountsVoucherDecriptions', count);
      newEntity.frequentDescriptions.forEach((r, idx) => {
        r.accountId = nextId;
        if (!r.id) {
          r.id = startId + idx;
        }
      });
    }
    return this.typeOrmRepo.save(newEntity);
  }

  async update(id: number, data: Partial<Account>): Promise<Account> {
    const existingEntity = await this.typeOrmRepo.findOne({
      where: { id },
      relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions']
    });
    if (!existingEntity) throw new Error('Account not found');

    if (data.relatedDetailedAccounts) {
      const incoming = data.relatedDetailedAccounts || [];
      const existing = existingEntity.relatedDetailedAccounts || [];

      const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
      const toDelete = existing.filter(x => !incomingIds.includes(x.id));
      if (toDelete.length > 0) {
        await this.typeOrmRepo.manager.remove(AccountsRelatedDetailedAccount, toDelete);
      }

      const nextCollection: AccountsRelatedDetailedAccount[] = [];
      for (const item of incoming) {
        if (item.id) {
          const existRecord = existing.find(x => x.id === Number(item.id));
          if (existRecord) {
            existRecord.detailedLevel = item.detailedLevel;
            existRecord.detailedTypeId = item.detailedTypeId;
            existRecord.accountId = id;
            
            nextCollection.push(existRecord);
          } else {
            const newId = item.id || await this.idGenerationService.generateNextId('AccountsRelatedDetailedAccount');
            const newRec = this.typeOrmRepo.manager.create(AccountsRelatedDetailedAccount, {
              ...item,
              id: newId,
              accountId: id
            });
            nextCollection.push(newRec);
          }
        } else {
          const newId = await this.idGenerationService.generateNextId('AccountsRelatedDetailedAccount');
          const newRec = this.typeOrmRepo.manager.create(AccountsRelatedDetailedAccount, {
            ...item,
            id: newId,
            accountId: id
          });
          nextCollection.push(newRec);
        }
      }
      existingEntity.relatedDetailedAccounts = nextCollection;
      if (nextCollection.length > 0) {
        await this.typeOrmRepo.manager.save(AccountsRelatedDetailedAccount, nextCollection);
      }
      delete data.relatedDetailedAccounts;
    }

    if (data.natureAdjustments) {
      const incoming = data.natureAdjustments || [];
      const existing = existingEntity.natureAdjustments || [];

      const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
      const toDelete = existing.filter(x => !incomingIds.includes(x.id));
      if (toDelete.length > 0) {
        await this.typeOrmRepo.manager.remove(AccountsNatureAdjusting, toDelete);
      }

      const nextCollection: AccountsNatureAdjusting[] = [];
      for (const item of incoming) {
        if (item.id) {
          const existRecord = existing.find(x => x.id === Number(item.id));
          if (existRecord) {
            existRecord.moinCode = item.moinCode;
            existRecord.moinTitle = item.moinTitle;
            existRecord.nature = item.nature;
            existRecord.description = item.description;
            existRecord.description2 = item.description2;
            existRecord.accountId = id;
            
            nextCollection.push(existRecord);
          } else {
            const newId = item.id || await this.idGenerationService.generateNextId('AccountsNatureAdjusting');
            const newRec = this.typeOrmRepo.manager.create(AccountsNatureAdjusting, {
              ...item,
              id: newId,
              accountId: id
            });
            nextCollection.push(newRec);
          }
        } else {
          const newId = await this.idGenerationService.generateNextId('AccountsNatureAdjusting');
          const newRec = this.typeOrmRepo.manager.create(AccountsNatureAdjusting, {
            ...item,
            id: newId,
            accountId: id
          });
          nextCollection.push(newRec);
        }
      }
      existingEntity.natureAdjustments = nextCollection;
      if (nextCollection.length > 0) {
        await this.typeOrmRepo.manager.save(AccountsNatureAdjusting, nextCollection);
      }
      delete data.natureAdjustments;
    }

    if (data.frequentDescriptions) {
      const incoming = data.frequentDescriptions || [];
      const existing = existingEntity.frequentDescriptions || [];

      const incomingIds = incoming.map(x => x.id).filter(Boolean).map(x => Number(x));
      const toDelete = existing.filter(x => !incomingIds.includes(x.id));
      if (toDelete.length > 0) {
        await this.typeOrmRepo.manager.remove(AccountsVoucherDecriptions, toDelete);
      }

      const nextCollection: AccountsVoucherDecriptions[] = [];
      for (const item of incoming) {
        if (item.id) {
          const existRecord = existing.find(x => x.id === Number(item.id));
          if (existRecord) {
            existRecord.description = item.description;
            existRecord.description2 = item.description2;
            existRecord.accountId = id;
            
            nextCollection.push(existRecord);
          } else {
            const newId = item.id || await this.idGenerationService.generateNextId('AccountsVoucherDecriptions');
            const newRec = this.typeOrmRepo.manager.create(AccountsVoucherDecriptions, {
              ...item,
              id: newId,
              accountId: id
            });
            nextCollection.push(newRec);
          }
        } else {
          const newId = await this.idGenerationService.generateNextId('AccountsVoucherDecriptions');
          const newRec = this.typeOrmRepo.manager.create(AccountsVoucherDecriptions, {
            ...item,
            id: newId,
            accountId: id
          });
          nextCollection.push(newRec);
        }
      }
      existingEntity.frequentDescriptions = nextCollection;
      if (nextCollection.length > 0) {
        await this.typeOrmRepo.manager.save(AccountsVoucherDecriptions, nextCollection);
      }
      delete data.frequentDescriptions;
    }

    const updatedEntity = this.typeOrmRepo.merge(existingEntity, data);

    const finalRelatedDetailedAccounts = existingEntity.relatedDetailedAccounts;
    const finalNatureAdjustments = existingEntity.natureAdjustments;
    const finalFrequentDescriptions = existingEntity.frequentDescriptions;

    updatedEntity.relatedDetailedAccounts = undefined;
    updatedEntity.natureAdjustments = undefined;
    updatedEntity.frequentDescriptions = undefined;

    const saved = await this.typeOrmRepo.save(updatedEntity);

    if (finalRelatedDetailedAccounts) {
      finalRelatedDetailedAccounts.forEach(r => {
        delete (r as any).account;
      });
    }
    if (finalNatureAdjustments) {
      finalNatureAdjustments.forEach(r => {
        delete (r as any).account;
      });
    }
    if (finalFrequentDescriptions) {
      finalFrequentDescriptions.forEach(r => {
        delete (r as any).account;
      });
    }

    saved.relatedDetailedAccounts = finalRelatedDetailedAccounts;
    saved.natureAdjustments = finalNatureAdjustments;
    saved.frequentDescriptions = finalFrequentDescriptions;

    return saved;
  }

  async findAll(search?: string, level?: number, options?: any): Promise<Account[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };

    if (options && options.isActive !== undefined) {
      where.isActive = options.isActive === 'true' || options.isActive === true;
    }

    const findOptions: any = { where, order: { code: 'ASC' } };
    if (options && options.limit !== undefined) {
      findOptions.take = options.limit;
    }

    const all = await this.typeOrmRepo.find(findOptions);
    
    if (level !== undefined) {
      const levelsMap = new Map<number, number>();
      const root = all.find(x => x.code === '0');
      if (root) {
        levelsMap.set(root.id, 0);
        const setLevel = (parentIds: number[], currentLevel: number) => {
          const children = all.filter(x => x.parentId && parentIds.includes(x.parentId));
          if (children.length > 0) {
            children.forEach(c => levelsMap.set(c.id, currentLevel));
            setLevel(children.map(c => c.id), currentLevel + 1);
          }
        };
        setLevel([root.id], 1);
      }
      
      let filtered = all.filter(a => levelsMap.get(a.id) === level);
      
      if (options) {
        if (options.accountType !== undefined && options.accountType !== '' && options.accountType !== 'null') {
          const reqType = parseInt(String(options.accountType), 10);
          if (!isNaN(reqType)) {
            const getGroupType = (acc: Account): number | undefined => {
              if (acc.accountType !== null && acc.accountType !== undefined && Number(acc.accountType) > 0) {
                return Number(acc.accountType);
              }
              let current: Account | undefined = acc;
              while (current && current.parentId) {
                const parent = all.find(x => Number(x.id) === Number(current!.parentId));
                if (parent) {
                  if (parent.accountType !== null && parent.accountType !== undefined && Number(parent.accountType) > 0) {
                    return Number(parent.accountType);
                  }
                  current = parent;
                } else {
                  break;
                }
              }
              return undefined;
            };

            filtered = filtered.filter(a => getGroupType(a) === reqType);
          }
        }

        if (options.filterByAdjustingNature !== undefined && options.filterByAdjustingNature !== '') {
            const mainNature = String(options.filterByAdjustingNature);
            const isMainDebtor = mainNature === '3' || mainNature === '5';
            const isMainCreditor = mainNature === '4' || mainNature === '6';
            
            filtered = filtered.filter(a => {
                const targetNature = a.accountNature ? String(a.accountNature) : '';
                if (isMainDebtor) {
                    if (targetNature !== '4' && targetNature !== '6') return false;
                } else if (isMainCreditor) {
                    if (targetNature !== '3' && targetNature !== '5') return false;
                } else {
                    return false;
                }
                return true;
            });
        }
        
        // 6 feature exact match
        const checkMatch = (key: string) => {
             if (options[key] !== undefined && options[key] !== '') {
                 const reqBool = options[key] === 'true' || options[key] === true;
                 filtered = filtered.filter(a => {
                     const aBool = (a as any)[key] === true || (a as any)[key] === 'true';
                     return aBool === reqBool;
                 });
             }
        };
        
        checkMatch('trackingFeature');
        checkMatch('currencyFeature');
        checkMatch('exchangeableFeature');
        checkMatch('trackingQuantity');
        checkMatch('trackingNumber');
        checkMatch('trackingDate');
      }

      if (search && search.trim() !== '') {
        const lowerSearch = search.toLowerCase().trim();
        filtered = filtered.filter(a => 
          (a.code && a.code.toLowerCase().includes(lowerSearch)) || 
          (a.title && a.title.toLowerCase().includes(lowerSearch)) || 
          (a.title_en && a.title_en.toLowerCase().includes(lowerSearch))
        );
      }
      
      filtered.forEach(item => {
        let current = item;
        while (current.parentId && !current.parent) {
          const parent = all.find(x => Number(x.id) === Number(current.parentId)) as Account;
          if (parent) {
            current.parent = parent;
            current = parent;
          } else {
            break;
          }
        }
      });

      if (options && options.columnFilters) {
        try {
          const filters = typeof options.columnFilters === 'string'
            ? JSON.parse(options.columnFilters)
            : options.columnFilters;
          if (Array.isArray(filters)) {
            filters.forEach((f: any) => {
              const fieldId = f.id;
              const op = f.value?.op || 'contains';
              const filterValue = String(f.value?.value || '').toLowerCase().trim();

              if (!filterValue && op !== 'isEmpty' && op !== 'isNotEmpty') return;

              filtered = filtered.filter(a => {
                let val: any = '';
                if (fieldId.includes('.')) {
                  const parts = fieldId.split('.');
                  let temp: any = a;
                  for (const part of parts) {
                    if (temp && typeof temp === 'object') {
                      temp = temp[part];
                    } else {
                      temp = undefined;
                    }
                  }
                  val = temp;
                } else {
                  val = (a as any)[fieldId];
                }

                const strVal = val !== undefined && val !== null ? String(val).toLowerCase() : '';

                switch (op) {
                  case 'contains':
                    return strVal.includes(filterValue);
                  case 'notContains':
                    return !strVal.includes(filterValue);
                  case 'startsWith':
                    return strVal.startsWith(filterValue);
                  case 'endsWith':
                    return strVal.endsWith(filterValue);
                  case 'equals':
                    return strVal === filterValue;
                  case 'notEquals':
                    return strVal !== filterValue;
                  case 'isEmpty':
                    return strVal === '';
                  case 'isNotEmpty':
                    return strVal !== '';
                  default:
                    return true;
                }
              });
            });
          }
        } catch (err) {
          console.error('Error parsing columnFilters in AccountRepository:', err);
        }
      }

      return filtered;
    }

    if (!search || search.trim() === '') {
      return all;
    }
    const lowerSearch = search.toLowerCase().trim();
    const matched = all.filter(a => 
      (a.code && a.code.toLowerCase().includes(lowerSearch)) || 
      (a.title && a.title.toLowerCase().includes(lowerSearch)) || 
      (a.title_en && a.title_en.toLowerCase().includes(lowerSearch))
    );
    
    const resultSet = new Set<number>();
    const addWithParents = (id: number) => {
      if (resultSet.has(id)) return;
      resultSet.add(id);
      const acc = all.find(x => x.id === id);
      if (acc && acc.parentId) {
        addWithParents(acc.parentId);
      }
    };
    
    for (const m of matched) {
      addWithParents(m.id);
    }
    
    // Always include root node
    const root = all.find(x => x.code === '0');
    if (root) resultSet.add(root.id);

    return all.filter(x => resultSet.has(x.id));
  }

  async findById(id: number): Promise<Account | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { id };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.typeOrmRepo.findOne({ 
      where, 
      relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions'] 
    });
  }

  async findByCode(code: string): Promise<Account | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { code };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.typeOrmRepo.findOne({ 
      where, 
      relations: ['relatedDetailedAccounts', 'natureAdjustments', 'frequentDescriptions'] 
    });
  }

  async findByTitle(title: string): Promise<Account | null> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { title };
    if (isShared) {
      where.businessStructureRef = bsId;
    } else {
      where.companyRef = compId;
    }
    return this.typeOrmRepo.findOne({ where });
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    const { bsId, compId, isShared } = await this.getScope();
    const queryBuilder = this.typeOrmRepo.createQueryBuilder('entity');
    
    if (typeof value === 'string' && (field === 'title' || field === 'title_en')) {
      const normalizedValue = value.replace(/[\s\u200c]+/g, '').replace(/ي/g, 'ی').replace(/ك/g, 'ک');
      queryBuilder.where(`REPLACE(REPLACE(REPLACE(REPLACE(CAST(entity.${field} AS text), ' ', ''), CHR(8204), ''), 'ي', 'ی'), 'ك', 'ک') = :value`, { value: normalizedValue });
    } else {
      queryBuilder.where(`entity.${field} = :value`, { value });
    }

    if (isShared) {
      queryBuilder.andWhere('entity.businessStructureRef = :bsId', { bsId });
    } else {
      queryBuilder.andWhere('entity.companyRef = :compId', { compId });
    }

    if (excludeId) {
      queryBuilder.andWhere('entity.id != :excludeId', { excludeId: parseInt(excludeId as any, 10) });
    }

    const count = await queryBuilder.getCount();
    return count > 0;
  }

  async delete(id: number): Promise<void> {
    await this.typeOrmRepo.delete(id);
  }

  async getGroupAccountLength(): Promise<number> {
    try {
      const compId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
      const repo = this.typeOrmRepo.manager.getRepository(BaseSettings);
      const settings = await repo.find({ where: { tabRef: 2 } });
      const found = settings.find(s => s.key.trim() === 'groupAccountLength');
      if (found && found.value) {
        const val = parseInt(found.value, 10);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch (err) {
      console.error('getGroupAccountLength error:', err);
    }
    return 2;
  }
}
