import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportGroup } from '../../domain/entities/report-group.entity';
import { IReportGroupRepository } from '../../domain/repositories/report-group.repository.interface';

@Injectable()
export class ReportGroupRepository implements IReportGroupRepository {
  constructor(
    @InjectRepository(ReportGroup)
    private readonly repository: Repository<ReportGroup>,
  ) {}

  async findAll(companyRef?: string, businessStructureRef?: string): Promise<ReportGroup[]> {
    const query = this.repository.createQueryBuilder('rg');

    if (companyRef) {
      query.andWhere('rg.companyRef = :companyRef', { companyRef });
    }
    if (businessStructureRef) {
      query.andWhere('rg.businessStructureRef = :businessStructureRef', { businessStructureRef });
    }

    return query.getMany();
  }

  async findById(id: string): Promise<ReportGroup | null> {
    return this.repository.findOne({ where: { reportGroupID: id } });
  }

  async create(reportGroup: ReportGroup): Promise<ReportGroup> {
    const newDoc = this.repository.create(reportGroup);
    return this.repository.save(newDoc);
  }

  async update(id: string, reportGroup: Partial<ReportGroup>): Promise<ReportGroup> {
    await this.repository.update(id, reportGroup);
    return this.findById(id) as Promise<ReportGroup>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
