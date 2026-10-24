import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportUserData } from '../../domain/entities/report-user-data.entity';
import { ReportUserDataRepositoryInterface } from '../../domain/repositories/report-user-data.repository.interface';

@Injectable()
export class ReportUserDataRepository implements ReportUserDataRepositoryInterface {
  constructor(
    @InjectRepository(ReportUserData)
    private readonly repository: Repository<ReportUserData>,
  ) {}

  async create(data: Partial<ReportUserData>): Promise<ReportUserData> {
    const reportUserData = this.repository.create(data);
    return await this.repository.save(reportUserData);
  }

  async findAll(authInfo: any): Promise<ReportUserData[]> {
    const query = this.repository.createQueryBuilder('reportUserData');
    if (authInfo?.companyRef) query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
    if (authInfo?.businessStructureRef) query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
    return await query.getMany();
  }

  async findByReportName(reportName: string, authInfo: any): Promise<ReportUserData[]> {
    const query = this.repository.createQueryBuilder('reportUserData');
    if (authInfo?.companyRef) query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
    if (authInfo?.businessStructureRef) query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
    query.andWhere('reportUserData.reportName = :reportName', { reportName });
    return await query.getMany();
  }

  async findByDynamicKey(reportName: string, dynamicKey: string, authInfo: any): Promise<ReportUserData> {
    const query = this.repository.createQueryBuilder('reportUserData');
    if (authInfo?.companyRef) query.andWhere('reportUserData.companyRef = :companyRef', { companyRef: authInfo.companyRef });
    if (authInfo?.businessStructureRef) query.andWhere('reportUserData.businessStructureRef = :businessStructureRef', { businessStructureRef: authInfo.businessStructureRef });
    query.andWhere('reportUserData.reportName = :reportName', { reportName });
    query.andWhere('reportUserData.dynamicKey = :dynamicKey', { dynamicKey });
    return await query.getOne();
  }

  async update(id: string, data: Partial<ReportUserData>): Promise<ReportUserData> {
    await this.repository.update(id, data);
    return await this.repository.findOne({ where: { reportUserDataID: id } });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

