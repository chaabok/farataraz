import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportField } from '../../domain/entities/report-field.entity';
import { IReportFieldRepository } from '../../domain/repositories/report-field.repository.interface';

@Injectable()
export class ReportFieldRepository implements IReportFieldRepository {
  constructor(
    @InjectRepository(ReportField)
    private readonly repository: Repository<ReportField>,
  ) {}

  async findByReportId(reportId: string): Promise<ReportField[]> {
    return this.repository.find({
      where: { reportRef: reportId },
      order: { orderIndex: 'ASC' }
    });
  }

  async findById(id: string): Promise<ReportField | null> {
    return this.repository.findOne({ where: { reportFieldID: id } });
  }

  async create(reportField: ReportField): Promise<ReportField> {
    const newDoc = this.repository.create(reportField);
    return this.repository.save(newDoc);
  }

  async update(id: string, reportField: Partial<ReportField>): Promise<ReportField> {
    await this.repository.update(id, reportField);
    return this.findById(id) as Promise<ReportField>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repository.delete({ reportRef: reportId });
  }
}
