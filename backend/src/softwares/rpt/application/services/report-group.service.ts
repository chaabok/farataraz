import { Injectable, Inject } from '@nestjs/common';
import { UpsertReportGroupDto } from '../dtos/upsert-report-group.dto';
import { IReportGroupRepository } from '../../domain/repositories/report-group.repository.interface';
import { ReportGroup } from '../../domain/entities/report-group.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class ReportGroupService {
  constructor(
    @Inject(IReportGroupRepository)
    private readonly reportGroupRepository: IReportGroupRepository,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async findAll(companyRef?: string, businessStructureRef?: string): Promise<ReportGroup[]> {
    return this.reportGroupRepository.findAll(companyRef, businessStructureRef);
  }

  async findById(id: string): Promise<ReportGroup | null> {
    return this.reportGroupRepository.findById(id);
  }

  async upsert(dto: UpsertReportGroupDto, companyRef: string, businessStructureRef: string): Promise<ReportGroup> {
    if (dto.reportGroupID) {
      // Update
      return this.reportGroupRepository.update(dto.reportGroupID, {
        title: dto.title
      });
    } else {
      // Create
      const newId = (await this.idGenerationService.generateNextId('ReportGroup')).toString();
      const newEntity = new ReportGroup();
      newEntity.reportGroupID = newId;
      newEntity.title = dto.title || '';
      newEntity.companyRef = Number(companyRef);
      newEntity.businessStructureRef = Number(businessStructureRef);
      return this.reportGroupRepository.create(newEntity);
    }
  }

  async delete(id: string): Promise<void> {
    await this.reportGroupRepository.delete(id);
  }
}
