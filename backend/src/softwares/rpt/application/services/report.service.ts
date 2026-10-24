import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { UpsertReportDto } from '../dtos/upsert-report.dto';
import { IReportRepository } from '../../domain/repositories/report.repository.interface';
import { IReportFieldRepository } from '../../domain/repositories/report-field.repository.interface';
import { IReportGroupingRepository } from '../../domain/repositories/report-grouping.repository.interface';
import { IReportFilterRepository } from '../../domain/repositories/report-filter.repository.interface';
import { IReportSortingRepository } from '../../domain/repositories/report-sorting.repository.interface';
import { IReportFormulaRepository } from '../../domain/repositories/report-formula.repository.interface';
import { IReportAggregateRepository } from '../../domain/repositories/report-aggregate.repository.interface';
import { Report } from '../../domain/entities/report.entity';
import { ReportField } from '../../domain/entities/report-field.entity';
import { ReportGrouping } from '../../domain/entities/report-grouping.entity';
import { ReportFilter } from '../../domain/entities/report-filter.entity';
import { ReportSorting } from '../../domain/entities/report-sorting.entity';
import { ReportFormula } from '../../domain/entities/report-formula.entity';
import { ReportAggregate } from '../../domain/entities/report-aggregate.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';

@Injectable()
export class ReportService {
  constructor(
    @Inject(IReportRepository)
    private readonly reportRepository: IReportRepository,
    @Inject(IReportFieldRepository)
    private readonly reportFieldRepository: IReportFieldRepository,
    @Inject(IReportGroupingRepository)
    private readonly reportGroupingRepository: IReportGroupingRepository,
    @Inject(IReportFilterRepository)
    private readonly reportFilterRepository: IReportFilterRepository,
    @Inject(IReportSortingRepository)
    private readonly reportSortingRepository: IReportSortingRepository,
    @Inject(IReportFormulaRepository)
    private readonly reportFormulaRepository: IReportFormulaRepository,
    @Inject(IReportAggregateRepository)
    private readonly reportAggregateRepository: IReportAggregateRepository,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  async findAll(companyRef?: string, businessStructureRef?: string, targetForm?: string): Promise<Report[]> {
    return this.reportRepository.findAll(companyRef, businessStructureRef, targetForm);
  }

  async findById(id: string): Promise<any> {
    const report = await this.reportRepository.findById(id);
    if (!report) return null;

    const [fields, groupings, filters, sortings, formulas, aggregates] = await Promise.all([
      this.reportFieldRepository.findByReportId(id),
      this.reportGroupingRepository.findByReportId(id),
      this.reportFilterRepository.findByReportId(id),
      this.reportSortingRepository.findByReportId(id),
      this.reportFormulaRepository.findAll(id),
      this.reportAggregateRepository.findByReportId(id)
    ]);

    return {
      ...report,
      fields,
      groupings,
      filters,
      sortings,
      formulas,
      aggregates
    };
  }

  async upsert(dto: UpsertReportDto, companyRef: string, businessStructureRef: string): Promise<any> {
    console.log('ReportService.upsert CALLED:', dto);
    let targetReportId = dto.reportID;

    if (targetReportId) {
      // Update basic report info
      await this.reportRepository.update(targetReportId, {
        reportGroupRef: dto.reportGroupRef,
        title: dto.title,
        direction: dto.direction,
        paperSize: dto.paperSize,
        paperOrientation: dto.paperOrientation,
        showInstitutionName: dto.showInstitutionName,
        showDate: dto.showDate,
        showRowNumber: dto.showRowNumber,
        showFilters: dto.showFilters,
        pageNumberType: dto.pageNumberType,
        showLogo: dto.showLogo,
        hideDuplicates: dto.hideDuplicates,
        dataSourceType: dto.dataSourceType,
        primaryTable: dto.primaryTable,
        targetForm: dto.targetForm,
        isDefaultTemplate: dto.isDefaultTemplate,
        isSystemReport: dto.isSystemReport,
        sqlScript: dto.sqlScript
      });
      
      // Update nested tables by recreating them
      await this.reportFieldRepository.deleteByReportId(targetReportId);
      await this.reportGroupingRepository.deleteByReportId(targetReportId);
      await this.reportFilterRepository.deleteByReportId(targetReportId);
      await this.reportSortingRepository.deleteByReportId(targetReportId);
      await this.reportFormulaRepository.deleteByReportId(targetReportId);
      await this.reportAggregateRepository.deleteByReportId(targetReportId);
      
    } else {
      // Create basic report info
      targetReportId = (await this.idGenerationService.generateNextId('Report')).toString();
      const newReport = new Report();
      newReport.reportID = targetReportId;
      newReport.companyRef = Number(companyRef);
      newReport.businessStructureRef = Number(businessStructureRef);
      newReport.reportGroupRef = dto.reportGroupRef || null as any;
      newReport.title = dto.title || '';
      newReport.direction = dto.direction || '';
      newReport.paperSize = dto.paperSize || '';
      newReport.paperOrientation = dto.paperOrientation || '';
      newReport.showInstitutionName = dto.showInstitutionName || false;
      newReport.showDate = dto.showDate || false;
      newReport.showRowNumber = dto.showRowNumber || false;
      newReport.showFilters = dto.showFilters || false;
      newReport.pageNumberType = dto.pageNumberType || '';
      newReport.showLogo = dto.showLogo || false;
      newReport.hideDuplicates = dto.hideDuplicates || false;
      newReport.dataSourceType = dto.dataSourceType || '';
      newReport.primaryTable = dto.primaryTable || '';
      newReport.targetForm = dto.targetForm || '';
      newReport.isDefaultTemplate = dto.isDefaultTemplate || false;
      newReport.isSystemReport = dto.isSystemReport || false;
      newReport.sqlScript = dto.sqlScript || '';
      await this.reportRepository.create(newReport);
    }

    if (dto.fields && dto.fields.length > 0) {
      for (const fieldDto of dto.fields) {
        const nf = new ReportField();
        nf.reportFieldID = (await this.idGenerationService.generateNextId('ReportField')).toString();
        nf.reportRef = targetReportId;
        nf.companyRef = Number(companyRef);
        nf.businessStructureRef = Number(businessStructureRef);
        nf.tableName = fieldDto.tableName || '';
        nf.fieldName = fieldDto.fieldName || '';
        nf.alias = fieldDto.alias || '';
        nf.orderIndex = fieldDto.orderIndex || 0;
        nf.isVisible = fieldDto.isVisible ?? true;
        await this.reportFieldRepository.create(nf);
      }
    }

    if (dto.groupings && dto.groupings.length > 0) {
      for (const groupDto of dto.groupings) {
        const ng = new ReportGrouping();
        ng.reportGroupingID = (await this.idGenerationService.generateNextId('ReportGrouping')).toString();
        ng.reportRef = targetReportId;
        ng.companyRef = Number(companyRef);
        ng.businessStructureRef = Number(businessStructureRef);
        ng.tableName = groupDto.tableName || '';
        ng.fieldName = groupDto.fieldName || '';
        ng.orderIndex = groupDto.orderIndex || 0;
        await this.reportGroupingRepository.create(ng);
      }
    }

    if (dto.filters && dto.filters.length > 0) {
      for (const filterDto of dto.filters) {
        const nf = new ReportFilter();
        nf.reportFilterID = (await this.idGenerationService.generateNextId('ReportFilter')).toString();
        nf.reportRef = targetReportId;
        nf.companyRef = Number(companyRef);
        nf.businessStructureRef = Number(businessStructureRef);
        nf.tableName = filterDto.tableName || '';
        nf.fieldName = filterDto.fieldName || '';
        nf.operator = filterDto.operator || '';
        nf.valueType = filterDto.valueType || '';
        nf.value = filterDto.value || '';
        nf.logicalOperator = filterDto.logicalOperator || '';
        nf.orderIndex = filterDto.orderIndex || 0;
        await this.reportFilterRepository.create(nf);
      }
    }

    if (dto.sortings && dto.sortings.length > 0) {
      for (const sortingDto of dto.sortings) {
        const ns = new ReportSorting();
        ns.reportSortingID = (await this.idGenerationService.generateNextId('ReportSorting')).toString();
        ns.reportRef = targetReportId;
        ns.companyRef = Number(companyRef);
        ns.businessStructureRef = Number(businessStructureRef);
        ns.tableName = sortingDto.tableName || '';
        ns.fieldName = sortingDto.fieldName || '';
        ns.sortDirection = sortingDto.sortDirection || '';
        ns.orderIndex = sortingDto.orderIndex || 0;
        await this.reportSortingRepository.create(ns);
      }
    }

    if (dto.formulas && dto.formulas.length > 0) {
      for (const formulaDto of dto.formulas) {
        const nform = new ReportFormula();
        nform.reportFormulaID = (await this.idGenerationService.generateNextId('ReportFormula')).toString();
        nform.reportRef = targetReportId;
        nform.companyRef = Number(companyRef);
        nform.businessStructureRef = Number(businessStructureRef);
        nform.formulaName = formulaDto.formulaName || '';
        nform.expression = formulaDto.expression || '';
        await this.reportFormulaRepository.create(nform);
      }
    }

    if (dto.aggregates && dto.aggregates.length > 0) {
      for (const aggDto of dto.aggregates) {
        const nagg = new ReportAggregate();
        nagg.reportAggregateID = (await this.idGenerationService.generateNextId('ReportAggregate')).toString();
        nagg.reportRef = targetReportId;
        nagg.companyRef = Number(companyRef);
        nagg.businessStructureRef = Number(businessStructureRef);
        nagg.field = aggDto.field || '';
        nagg.groupBy = aggDto.groupBy || '';
        nagg.printPosition = aggDto.printPosition || '';
        nagg.hasPageTotal = aggDto.hasPageTotal || false;
        nagg.hasGrandTotal = aggDto.hasGrandTotal || false;
        await this.reportAggregateRepository.create(nagg);
      }
    }

    return this.findById(targetReportId);
  }

  async delete(id: string): Promise<void> {
    await this.reportFieldRepository.deleteByReportId(id);
    await this.reportGroupingRepository.deleteByReportId(id);
    await this.reportFilterRepository.deleteByReportId(id);
    await this.reportSortingRepository.deleteByReportId(id);
    await this.reportFormulaRepository.deleteByReportId(id);
    await this.reportAggregateRepository.deleteByReportId(id);
    await this.reportRepository.delete(id);
  }
}
