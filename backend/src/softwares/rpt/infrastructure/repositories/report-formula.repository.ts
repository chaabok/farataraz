import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReportFormula } from '../../domain/entities/report-formula.entity';
import { IReportFormulaRepository } from '../../domain/repositories/report-formula.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class ReportFormulaRepository implements IReportFormulaRepository {
  constructor(
    @InjectRepository(ReportFormula)
    private readonly repository: Repository<ReportFormula>,
    private readonly idService: IdGenerationService,
  ) {}

  async findAll(reportId: string): Promise<ReportFormula[]> {
    return this.repository.find({
      where: { reportRef: reportId },
      order: { formulaName: 'ASC' }
    });
  }

  async findById(id: string): Promise<ReportFormula | null> {
    return this.repository.findOne({ where: { reportFormulaID: id } });
  }

  async create(entity: Partial<ReportFormula>): Promise<ReportFormula> {
    const id = await this.idService.generateNextId('ReportFormula');
    const newEntity = this.repository.create({
      ...entity,
      reportFormulaID: id.toString()
    });
    return this.repository.save(newEntity);
  }

  async update(id: string, entity: Partial<ReportFormula>): Promise<ReportFormula> {
    await this.repository.update(id, entity);
    return this.findById(id) as Promise<ReportFormula>;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByReportId(reportId: string): Promise<void> {
    await this.repository.delete({ reportRef: reportId });
  }
}
