import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Project } from '../../domain/entities/project.entity';
import { DetailedType } from '../../../accounting/domain/entities/detailed-type.entity';
import { DetailedAccountsNumbering } from '../../../common/domain/entities/detailed-accounts-numbering.entity';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(DetailedType)
    private detailedTypeRepository: Repository<DetailedType>,
    @InjectRepository(DetailedAccountsNumbering)
    private numberingRepository: Repository<DetailedAccountsNumbering>,
    private readonly detailedAccountsNumberingService: DetailedAccountsNumberingService,
    private readonly detailedAccountService: DetailedAccountService,
    private dataSource: DataSource,
    private readonly requestContextService: RequestContextService,
  ) {}

  private async getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;
    let isShared = true;

    try {
      const rows = await this.projectRepository.manager.connection.query(
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

  async findAll(): Promise<Project[]> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = isShared ? { businessStructureRef: bsId } : { companyRef: compId };
    return this.projectRepository.find({ where, order: { code: 'ASC' } });
  }

  async findOne(id: number): Promise<Project> {
    const { bsId, compId, isShared } = await this.getScope();
    const where: any = { projectId: id };
    if (isShared) where.businessStructureRef = bsId;
    else where.companyRef = compId;
    return this.projectRepository.findOne({ where });
  }

  async create(data: Partial<Project>): Promise<Project> {
    const { bsId, compId } = await this.getScope();
    if (!data.businessStructureRef || data.businessStructureRef <= 1) data.businessStructureRef = bsId;
    if (!data.companyRef || data.companyRef <= 1) data.companyRef = compId;
    // Find DetailedType for code '8' (Project)
    const detailedType = await this.detailedTypeRepository.findOne({ 
      where: { code: '8' }
    });

    if (!detailedType) {
      throw new BadRequestException('Detailed type with code "8" (پروژه) not found in accounting.');
    }

    // 1. Assign DetailedAccountCode if not provided
    if (!data.detailedAccountCode) {
      // Get numbering from service which handles defaults
      const viewList = await this.detailedAccountsNumberingService.getViewList();
      const numbering = viewList.find(n => n.detailedTypesId === detailedType.detailedTypesId);

      if (!numbering) {
        throw new BadRequestException('Detailed account numbering range not defined for Projects.');
      }

      const nextCodeStr = await this.detailedAccountsNumberingService.getNextCode(detailedType.detailedTypesId);
      const nextCode = parseInt(nextCodeStr, 10);

      if (nextCode > numbering.endNumber) {
        throw new BadRequestException(`Detailed account numbering range exhausted for Projects. Max: ${numbering.endNumber}`);
      }

      data.detailedAccountCode = nextCodeStr;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Create DetailedAccount
      const newDa = await this.detailedAccountService.create({
        code: data.detailedAccountCode,
        title: data.title,
        title_en: data.titleEn,
        detailedTypesId: detailedType.detailedTypesId,
        isActive: data.isActive ?? true,
      });
      data.detailedAccountId = newDa.detailedAccountId;

      const project = this.projectRepository.create(data);
      const saved = await queryRunner.manager.save(project);
      
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, data: Partial<Project>): Promise<Project> {
    const existing = await this.findOne(id);
    if (!existing) throw new BadRequestException('پروژه یافت نشد');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update Detailed Account if it exists
      if (existing.detailedAccountId) {
        await this.detailedAccountService.update(existing.detailedAccountId, {
          code: data.detailedAccountCode || existing.detailedAccountCode,
          title: data.title || existing.title,
          title_en: data.titleEn || existing.titleEn,
          detailedTypesId: existing.detailedAccount?.detailedTypesId || 8,
          isActive: data.isActive ?? existing.isActive,
        });
      }

      await queryRunner.manager.update(Project, id, data);
      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    if (!existing) return;

    const detailedAccountId = existing.detailedAccountId;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (detailedAccountId) {
        // Shared transaction manager to avoid deadlocks and ensure atomicity.
        // This will also cleanup the project itself because DetailedAccountService.remove cleans up linked base forms.
        await this.detailedAccountService.remove(detailedAccountId, queryRunner.manager);
      } else {
        // If no detailed account, just delete the project directly
        await queryRunner.manager.delete(Project, id);
      }

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
