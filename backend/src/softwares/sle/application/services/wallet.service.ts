import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { IWalletRepository, IWalletRepositoryToken } from '../../domain/repositories/wallet.repository.interface';
import { Wallet } from '../../domain/entities/wallet.entity';
import { CreateWalletDto, UpdateWalletDto } from '../dtos/create-wallet.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class WalletService {
  constructor(
    @Inject(IWalletRepositoryToken)
    private readonly repository: IWalletRepository,
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
      const rows = await this.repository.manager.connection.query(
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

  async findAll(): Promise<Wallet[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.repository.findAll({ where });
  }

  async findById(id: number): Promise<Wallet> {
    const wallet = await this.repository.findById(id);
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async getNextNumber(): Promise<{ documentNumber: number; isDocumentNumberAuto: boolean }> {
    const wallets = await this.findAll();
    let max = 0;
    for (const w of wallets) {
      if (w.Code && w.Code > max) {
        max = w.Code;
      }
    }
    return {
      documentNumber: max + 1,
      isDocumentNumberAuto: false,
    };
  }

  async checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean> {
    if (value === undefined || value === null || String(value).trim() === '') return false;
    const { bsId, compId, isShared } = await this.getScope();

    const qb = this.repository.manager.createQueryBuilder(Wallet, 'w');
    qb.where(`w.${field} = :value`, { value });

    if (isShared) {
      qb.andWhere('w.businessStructureRef = :bsId', { bsId });
    } else {
      qb.andWhere('w.companyRef = :compId', { compId });
    }

    if (excludeId) {
      qb.andWhere('w.WalletID != :excludeId', { excludeId });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async create(dto: CreateWalletDto): Promise<Wallet> {
    const { bsId, compId, isShared } = await this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    if (!dto.Code) {
      throw new BadRequestException('فیلد کد اجباری است.');
    }
    if (!dto.Title) {
      throw new BadRequestException('فیلد عنوان اجباری است.');
    }

    if (await this.checkDuplicate('Code', dto.Code)) {
      throw new BadRequestException('کد کیف پول تکراری است.');
    }
    if (await this.checkDuplicate('Title', dto.Title)) {
      throw new BadRequestException('عنوان کیف پول تکراری است.');
    }

    const title2 = dto.Title2 && dto.Title2.trim() !== '' ? dto.Title2 : dto.Title;
    const id = dto.WalletID || (await this.idGenerationService.generateNextId('Wallets'));

    const entity = this.repository.manager.create(Wallet, {
      WalletID: id,
      Code: dto.Code,
      Title: dto.Title,
      Title2: title2,
      Nature: dto.Nature !== undefined ? dto.Nature : 1,
      IsActive: dto.IsActive !== undefined ? dto.IsActive : true,
      Description: dto.Description || '',
      creator: userId,
      lastModifier: userId,
      companyRef: compId,
      businessStructureRef: bsId,
    });

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateWalletDto): Promise<Wallet> {
    const existing = await this.findById(id);

    if (dto.Code !== undefined && dto.Code !== existing.Code) {
      if (await this.checkDuplicate('Code', dto.Code, id)) {
        throw new BadRequestException('کد کیف پول تکراری است.');
      }
    }
    if (dto.Title !== undefined && dto.Title !== existing.Title) {
      if (await this.checkDuplicate('Title', dto.Title, id)) {
        throw new BadRequestException('عنوان کیف پول تکراری است.');
      }
    }

    const title2 = dto.Title2 !== undefined 
      ? (dto.Title2.trim() !== '' ? dto.Title2 : (dto.Title || existing.Title)) 
      : existing.Title2;

    const userId = this.requestContextService.getUserId() || 1;
    const updateData: Partial<Wallet> = {
      ...dto,
      Title2: title2,
      lastModifier: userId,
    };

    return this.repository.update(id, updateData);
  }

  async remove(id: number): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
