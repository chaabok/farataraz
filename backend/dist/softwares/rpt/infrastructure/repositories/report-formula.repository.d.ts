import { Repository } from 'typeorm';
import { ReportFormula } from '../../domain/entities/report-formula.entity';
import { IReportFormulaRepository } from '../../domain/repositories/report-formula.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class ReportFormulaRepository implements IReportFormulaRepository {
    private readonly repository;
    private readonly idService;
    constructor(repository: Repository<ReportFormula>, idService: IdGenerationService);
    findAll(reportId: string): Promise<ReportFormula[]>;
    findById(id: string): Promise<ReportFormula | null>;
    create(entity: Partial<ReportFormula>): Promise<ReportFormula>;
    update(id: string, entity: Partial<ReportFormula>): Promise<ReportFormula>;
    delete(id: string): Promise<void>;
    deleteByReportId(reportId: string): Promise<void>;
}
