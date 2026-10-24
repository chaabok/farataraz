import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportAggregate } from '../../domain/entities/report-aggregate.entity';
import { IReportAggregateRepository } from '../../domain/repositories/report-aggregate.repository.interface';

@Injectable()
export class ReportAggregateRepository implements IReportAggregateRepository {
  constructor(
    @InjectRepository(ReportAggregate)
    private readonly repo: Repository<ReportAggregate>,
  ) {}

  async create(aggregate: ReportAggregate): Promise<ReportAggregate> {
    const et = this.repo.create(aggregate);
    return this.repo.save(et);
  }

  async findByReportId(reportId: string): Promise<ReportAggregate[]> {
    return this.repo.find({ where: { reportRef: reportId } });
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repo.delete({ reportRef: reportId });
  }
}
