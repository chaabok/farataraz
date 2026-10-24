import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportSorting } from '../../domain/entities/report-sorting.entity';
import { IReportSortingRepository } from '../../domain/repositories/report-sorting.repository.interface';

@Injectable()
export class ReportSortingRepository implements IReportSortingRepository {
  constructor(
    @InjectRepository(ReportSorting)
    private readonly repository: Repository<ReportSorting>,
  ) {}

  async findByReportId(reportId: string): Promise<ReportSorting[]> {
    return this.repository.find({
      where: { reportRef: reportId },
      order: { orderIndex: 'ASC' }
    });
  }

  async findById(id: string): Promise<ReportSorting | null> {
    return this.repository.findOne({ where: { reportSortingID: id } });
  }

  async create(reportSorting: ReportSorting): Promise<ReportSorting> {
    const newDoc = this.repository.create(reportSorting);
    return this.repository.save(newDoc);
  }

  async update(id: string, reportSorting: Partial<ReportSorting>): Promise<ReportSorting> {
    await this.repository.update(id, reportSorting);
    return this.findById(id) as Promise<ReportSorting>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repository.delete({ reportRef: reportId });
  }
}
