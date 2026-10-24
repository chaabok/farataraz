import { Injectable, Inject } from '@nestjs/common';
import { ReportUserDataRepositoryInterface } from '../../domain/repositories/report-user-data.repository.interface';
import { UpsertReportUserDataDto } from '../dtos/upsert-report-user-data.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class ReportUserDataService {
  constructor(
    @Inject('ReportUserDataRepositoryInterface')
    private readonly reportUserDataRepository: ReportUserDataRepositoryInterface,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async upsertData(dto: UpsertReportUserDataDto, authInfo: any) {
    const { reportName, data } = dto;
    
    for (const item of data) {
      const existing = await this.reportUserDataRepository.findByDynamicKey(reportName, item.dynamicKey, authInfo);
      
      if (existing) {
        await this.reportUserDataRepository.update(existing.reportUserDataID, {
          value: item.value
        });
      } else {
        const id = await this.idGenerationService.generateNextId('ReportUserData');
        await this.reportUserDataRepository.create({
          reportUserDataID: id.toString(),
          reportName: reportName,
          dynamicKey: item.dynamicKey,
          value: item.value,
          businessStructureRef: authInfo.businessStructureRef?.toString(),
          companyRef: authInfo.companyRef?.toString()
        });
      }
    }
    
    return { success: true };
  }

  async getByReportName(reportName: string, authInfo: any) {
    return await this.reportUserDataRepository.findByReportName(reportName, authInfo);
  }
}
