import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../../domain/entities/report.entity';
import { IReportRepository } from '../../domain/repositories/report.repository.interface';

@Injectable()
export class ReportRepository implements IReportRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  async findAll(companyRef?: string, businessStructureRef?: string, targetForm?: string): Promise<Report[]> {
    const query = this.repository.createQueryBuilder('report')
    .leftJoinAndSelect('report.reportGroupEntity', 'reportGroup');

    if (companyRef) {
      query.andWhere('(report.companyRef = :companyRef OR report.isSystemReport = :sys)', { companyRef, sys: true });
    }
    if (businessStructureRef) {
      query.andWhere('(report.businessStructureRef = :businessStructureRef OR report.isSystemReport = :sys)', { businessStructureRef, sys: true });
    }
    
    if (targetForm) {
      query.andWhere('report.targetForm = :targetForm', { targetForm });
    }

    // console.log('SQL:', query.getSql(), query.getParameters());
    return query.getMany();
  }

  async findById(id: string): Promise<Report | null> {
    return this.repository.findOne({ 
      where: { reportID: id },
      relations: ['reportGroupEntity']
    });
  }

  async create(report: Report): Promise<Report> {
    const newDoc = this.repository.create(report);
    return this.repository.save(newDoc);
  }

  async update(id: string, report: Partial<Report>): Promise<Report> {
    await this.repository.update(id, report);
    return this.findById(id) as Promise<Report>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
