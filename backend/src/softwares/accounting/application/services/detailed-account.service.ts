import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { CreateDetailedAccountDto } from '../dtos/create-detailed-account.dto';
import { UpdateDetailedAccountDto } from '../dtos/update-detailed-account.dto';
import { IDetailedAccountRepository, IDetailedAccountRepositoryToken } from '../../domain/repositories/detailed-account.repository.interface';

@Injectable()
export class DetailedAccountService {
  constructor(
    @Inject(IDetailedAccountRepositoryToken)
    private readonly detailedAccountRepository: IDetailedAccountRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateDetailedAccountDto): Promise<DetailedAccount> {
    const isCodeDuplicated = await this.checkDuplicate('code', createDto.code);
    if (isCodeDuplicated) throw new BadRequestException('کد وارد شده قبلا ثبت شده است');
    
    const isTitleDuplicated = await this.checkDuplicate('title', createDto.title);
    if (isTitleDuplicated) throw new BadRequestException('عنوان وارد شده قبلا ثبت شده است');
    
    if (createDto.title_en) {
      const isTitleEnDuplicated = await this.checkDuplicate('title_en', createDto.title_en);
      if (isTitleEnDuplicated) throw new BadRequestException('عنوان لاتین وارد شده قبلا ثبت شده است');
    }

    const data: any = { ...createDto };
    return this.detailedAccountRepository.create(data);
  }

  async update(id: number, updateDto: UpdateDetailedAccountDto): Promise<DetailedAccount> {
    await this.findOne(id); // check existence
    
    if (updateDto.code) {
      const isCodeDuplicated = await this.checkDuplicate('code', updateDto.code, id);
      if (isCodeDuplicated) throw new BadRequestException('کد وارد شده قبلا ثبت شده است');
    }

    if (updateDto.title) {
      const isTitleDuplicated = await this.checkDuplicate('title', updateDto.title, id);
      if (isTitleDuplicated) throw new BadRequestException('عنوان وارد شده قبلا ثبت شده است');
    }

    if (updateDto.title_en) {
      const isTitleEnDuplicated = await this.checkDuplicate('title_en', updateDto.title_en, id);
      if (isTitleEnDuplicated) throw new BadRequestException('عنوان لاتین وارد شده قبلا ثبت شده است');
    }

    const data: any = { ...updateDto };
    return this.detailedAccountRepository.update(id, data);
  }

  async findAll(): Promise<DetailedAccount[]> {
    return this.detailedAccountRepository.findAll();
  }

  async findWithPagination(params: {
    pageIndex: number;
    pageSize: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
  }): Promise<{ items: DetailedAccount[], total: number }> {
    const [items, total] = await this.detailedAccountRepository.findAdvanced(params);
    return { items, total };
  }

  async findOne(id: number): Promise<DetailedAccount> {
    const item = await this.detailedAccountRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`DetailedAccount with ID ${id} not found`);
    }
    return item;
  }

  async remove(id: number, manager?: any): Promise<void> {
    await this.removeMany([id], manager);
  }

  async removeMany(ids: number[], manager?: any): Promise<void> {
    if (manager) {
      await this.executeCleanup(ids, manager);
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.executeCleanup(ids, queryRunner.manager);
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async executeCleanup(ids: number[], manager: any): Promise<void> {
    if (!ids || ids.length === 0) return;
    
    // Helper to format table name with proper quoting for Postgres
    const getTableName = (schema: string, table: string) => {
      return `"${schema}"."${table}"`;
    };

    try {
      // 1. Cleanup Cash (Type 2 / Base Form)
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Rap', 'Cashes'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();

      // 2. Cleanup Project (Type 8 / Base Form)
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Cnt', 'Projects'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();

      // NEW: Cleanup Contracts
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Cnt', 'Contracts'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();

      // NEW: Cleanup Parties
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Gnr', 'Parties'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();

      // 3. Cleanup CostCenter
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Acc', 'CostCenter'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();

      // 4. Delete the DetailedAccounts themselves
      await manager.createQueryBuilder()
        .delete()
        .from(getTableName('Acc', 'DetailedAccounts'))
        .where('"DetailedAccountID" IN (:...ids)', { ids })
        .execute();
    } catch (error) {
      console.error('Error in executeCleanup:', error);
      throw new BadRequestException('حذف این حساب تفصیلی امکان پذیر نیست.');
    }
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    return this.detailedAccountRepository.checkDuplicate(field, value, excludeId);
  }
}
