import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportFilter } from '../../domain/entities/report-filter.entity';
import { IReportFilterRepository } from '../../domain/repositories/report-filter.repository.interface';

@Injectable()
export class ReportFilterRepository implements IReportFilterRepository {
  constructor(
    @InjectRepository(ReportFilter)
    private readonly repository: Repository<ReportFilter>,
  ) {}

  async findByReportId(reportId: string): Promise<ReportFilter[]> {
    return this.repository.find({
      where: { reportRef: reportId },
      order: { orderIndex: 'ASC' }
    });
  }

  async findById(id: string): Promise<ReportFilter | null> {
    return this.repository.findOne({ where: { reportFilterID: id } });
  }

  async create(reportFilter: ReportFilter): Promise<ReportFilter> {
    const newDoc = this.repository.create(reportFilter);
    return this.repository.save(newDoc);
  }

  async update(id: string, reportFilter: Partial<ReportFilter>): Promise<ReportFilter> {
    await this.repository.update(id, reportFilter);
    return this.findById(id) as Promise<ReportFilter>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repository.delete({ reportRef: reportId });
  }
}
