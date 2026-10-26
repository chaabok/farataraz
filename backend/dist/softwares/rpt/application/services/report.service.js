"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const report_repository_interface_1 = require("../../domain/repositories/report.repository.interface");
const report_field_repository_interface_1 = require("../../domain/repositories/report-field.repository.interface");
const report_grouping_repository_interface_1 = require("../../domain/repositories/report-grouping.repository.interface");
const report_filter_repository_interface_1 = require("../../domain/repositories/report-filter.repository.interface");
const report_sorting_repository_interface_1 = require("../../domain/repositories/report-sorting.repository.interface");
const report_formula_repository_interface_1 = require("../../domain/repositories/report-formula.repository.interface");
const report_aggregate_repository_interface_1 = require("../../domain/repositories/report-aggregate.repository.interface");
const report_entity_1 = require("../../domain/entities/report.entity");
const report_field_entity_1 = require("../../domain/entities/report-field.entity");
const report_grouping_entity_1 = require("../../domain/entities/report-grouping.entity");
const report_filter_entity_1 = require("../../domain/entities/report-filter.entity");
const report_sorting_entity_1 = require("../../domain/entities/report-sorting.entity");
const report_formula_entity_1 = require("../../domain/entities/report-formula.entity");
const report_aggregate_entity_1 = require("../../domain/entities/report-aggregate.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
let ReportService = class ReportService {
    constructor(reportRepository, reportFieldRepository, reportGroupingRepository, reportFilterRepository, reportSortingRepository, reportFormulaRepository, reportAggregateRepository, idGenerationService) {
        this.reportRepository = reportRepository;
        this.reportFieldRepository = reportFieldRepository;
        this.reportGroupingRepository = reportGroupingRepository;
        this.reportFilterRepository = reportFilterRepository;
        this.reportSortingRepository = reportSortingRepository;
        this.reportFormulaRepository = reportFormulaRepository;
        this.reportAggregateRepository = reportAggregateRepository;
        this.idGenerationService = idGenerationService;
    }
    async findAll(companyRef, businessStructureRef, targetForm) {
        return this.reportRepository.findAll(companyRef, businessStructureRef, targetForm);
    }
    async findById(id) {
        const report = await this.reportRepository.findById(id);
        if (!report)
            return null;
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
    async upsert(dto, companyRef, businessStructureRef) {
        console.log('ReportService.upsert CALLED:', dto);
        let targetReportId = dto.reportID;
        if (targetReportId) {
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
            await this.reportFieldRepository.deleteByReportId(targetReportId);
            await this.reportGroupingRepository.deleteByReportId(targetReportId);
            await this.reportFilterRepository.deleteByReportId(targetReportId);
            await this.reportSortingRepository.deleteByReportId(targetReportId);
            await this.reportFormulaRepository.deleteByReportId(targetReportId);
            await this.reportAggregateRepository.deleteByReportId(targetReportId);
        }
        else {
            targetReportId = (await this.idGenerationService.generateNextId('Report')).toString();
            const newReport = new report_entity_1.Report();
            newReport.reportID = targetReportId;
            newReport.companyRef = Number(companyRef);
            newReport.businessStructureRef = Number(businessStructureRef);
            newReport.reportGroupRef = dto.reportGroupRef || null;
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
                const nf = new report_field_entity_1.ReportField();
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
                const ng = new report_grouping_entity_1.ReportGrouping();
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
                const nf = new report_filter_entity_1.ReportFilter();
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
                const ns = new report_sorting_entity_1.ReportSorting();
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
                const nform = new report_formula_entity_1.ReportFormula();
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
                const nagg = new report_aggregate_entity_1.ReportAggregate();
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
    async delete(id) {
        await this.reportFieldRepository.deleteByReportId(id);
        await this.reportGroupingRepository.deleteByReportId(id);
        await this.reportFilterRepository.deleteByReportId(id);
        await this.reportSortingRepository.deleteByReportId(id);
        await this.reportFormulaRepository.deleteByReportId(id);
        await this.reportAggregateRepository.deleteByReportId(id);
        await this.reportRepository.delete(id);
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(report_repository_interface_1.IReportRepository)),
    __param(1, (0, common_1.Inject)(report_field_repository_interface_1.IReportFieldRepository)),
    __param(2, (0, common_1.Inject)(report_grouping_repository_interface_1.IReportGroupingRepository)),
    __param(3, (0, common_1.Inject)(report_filter_repository_interface_1.IReportFilterRepository)),
    __param(4, (0, common_1.Inject)(report_sorting_repository_interface_1.IReportSortingRepository)),
    __param(5, (0, common_1.Inject)(report_formula_repository_interface_1.IReportFormulaRepository)),
    __param(6, (0, common_1.Inject)(report_aggregate_repository_interface_1.IReportAggregateRepository)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, id_generation_service_1.IdGenerationService])
], ReportService);
//# sourceMappingURL=report.service.js.map