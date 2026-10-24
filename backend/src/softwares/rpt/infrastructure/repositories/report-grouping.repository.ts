import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportGrouping } from '../../domain/entities/report-grouping.entity';
import { IReportGroupingRepository } from '../../domain/repositories/report-grouping.repository.interface';

@Injectable()
export class ReportGroupingRepository implements IReportGroupingRepository {
  constructor(
    @InjectRepository(ReportGrouping)
    private readonly repository: Repository<ReportGrouping>,
  ) {}

  async findByReportId(reportId: string): Promise<ReportGrouping[]> {
    return this.repository.find({
      where: { reportRef: reportId },
      order: { orderIndex: 'ASC' }
    });
  }

  async findById(id: string): Promise<ReportGrouping | null> {
    return this.repository.findOne({ where: { reportGroupingID: id } });
  }

  async create(reportGrouping: ReportGrouping): Promise<ReportGrouping> {
    const newDoc = this.repository.create(reportGrouping);
    return this.repository.save(newDoc);
  }

  async update(id: string, reportGrouping: Partial<ReportGrouping>): Promise<ReportGrouping> {
    await this.repository.update(id, reportGrouping);
    return this.findById(id) as Promise<ReportGrouping>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repository.delete({ reportRef: reportId });
  }
}
