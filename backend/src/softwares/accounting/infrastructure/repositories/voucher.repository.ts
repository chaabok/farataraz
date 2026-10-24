import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Voucher } from '../../domain/entities/voucher.entity';
import { IVoucherRepository } from '../../domain/repositories/voucher.repository.interface';
import { VoucherType } from '../../domain/entities/voucher-type.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { AccountsRelatedDetailedAccount } from '../../domain/entities/accounts-related-detailed-account.entity';
import { User } from '../../../../core/iam/entities/user.entity';

@Injectable()
export class VoucherRepository implements IVoucherRepository {
  constructor(
    @InjectRepository(Voucher)
    private readonly repository: Repository<Voucher>,
  ) {}

  async create(data: Partial<Voucher>): Promise<Voucher> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<Voucher>): Promise<Voucher> {
    await this.repository.update({ voucherId: id }, data);
    return this.findById(id) as Promise<Voucher>;
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete({ voucherId: id });
  }

  async findById(id: number): Promise<Voucher | null> {
    const voucher = await this.repository.findOne({ where: { voucherId: id }, relations: ['items'] });
    if (!voucher) return null;

    if (voucher.creator) {
      const creatorUser = await this.repository.manager.findOne(User, { where: { id: voucher.creator } });
      if (creatorUser) {
        voucher['creatorName'] = `${creatorUser.firstName || ''} ${creatorUser.lastName || ''}`.trim() || creatorUser.username;
      }
    }

    if (voucher.voucherTypeId) {
      voucher['voucherType'] = await this.repository.manager.findOne(VoucherType, { where: { voucherTypeId: voucher.voucherTypeId } });
    }

    // TypeORM won't load unmapped relations, let's load manually
    if (voucher.items && voucher.items.length > 0) {
      for (const item of voucher.items) {
        if (item.accountId) {
          item['account'] = await this.repository.manager.findOne(Account, { 
            where: { id: item.accountId },
            relations: ['parent', 'parent.parent']
          });
          // Fetch related types for account
          if (item['account']) {
            item['account'].relatedDetailedAccounts = await this.repository.manager.find(AccountsRelatedDetailedAccount, { where: { accountId: item.accountId }, relations: ['detailedType'] });
          }
        }
        if (item.detailedAccountId1) {
          item['detailedAccount1'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId1 } });
        }
        if (item.detailedAccountId2) {
          item['detailedAccount2'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId2 } });
        }
        if (item.detailedAccountId3) {
          item['detailedAccount3'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId3 } });
        }
        if (item.detailedAccountId4) {
          item['detailedAccount4'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId4 } });
        }
        if (item.detailedAccountId5) {
          item['detailedAccount5'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId5 } });
        }
        if (item.detailedAccountId6) {
          item['detailedAccount6'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId6 } });
        }
        if (item.detailedAccountId7) {
          item['detailedAccount7'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId7 } });
        }
        if (item.detailedAccountId8) {
          item['detailedAccount8'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId8 } });
        }
        if (item.detailedAccountId9) {
          item['detailedAccount9'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId9 } });
        }
        if (item.detailedAccountId10) {
          item['detailedAccount10'] = await this.repository.manager.findOne(DetailedAccount, { where: { detailedAccountId: item.detailedAccountId10 } });
        }
      }
    }
    return voucher;
  }

  async findAll(companyId?: number): Promise<Voucher[]> {
    const where: any = {};
    if (companyId) {
      where.companyRef = companyId;
    }
    const vouchers = await this.repository.find({ 
      where, 
      order: { voucherDate: 'DESC', voucherId: 'DESC' } 
    });
    for (const voucher of vouchers) {
      if (voucher.creator) {
        const creatorUser = await this.repository.manager.findOne(User, { where: { id: voucher.creator } });
        if (creatorUser) {
          voucher['creatorName'] = `${creatorUser.firstName || ''} ${creatorUser.lastName || ''}`.trim() || creatorUser.username;
        }
      }
      if (voucher.voucherTypeId) {
        const vt = await this.repository.manager.findOne(VoucherType, { where: { voucherTypeId: voucher.voucherTypeId } });
        if (vt) {
          voucher['voucherTypeTitle'] = vt.title;
        }
      }
    }
    return vouchers;
  }
}
