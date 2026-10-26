"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RptModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const common_module_1 = require("../common/common.module");
const core_module_1 = require("../../core/core.module");
const report_group_entity_1 = require("./domain/entities/report-group.entity");
const report_entity_1 = require("./domain/entities/report.entity");
const report_field_entity_1 = require("./domain/entities/report-field.entity");
const report_grouping_entity_1 = require("./domain/entities/report-grouping.entity");
const report_filter_entity_1 = require("./domain/entities/report-filter.entity");
const report_sorting_entity_1 = require("./domain/entities/report-sorting.entity");
const report_permission_entity_1 = require("./domain/entities/report-permission.entity");
const report_user_data_entity_1 = require("./domain/entities/report-user-data.entity");
const report_formula_entity_1 = require("./domain/entities/report-formula.entity");
const report_aggregate_entity_1 = require("./domain/entities/report-aggregate.entity");
const report_group_repository_interface_1 = require("./domain/repositories/report-group.repository.interface");
const report_repository_interface_1 = require("./domain/repositories/report.repository.interface");
const report_field_repository_interface_1 = require("./domain/repositories/report-field.repository.interface");
const report_grouping_repository_interface_1 = require("./domain/repositories/report-grouping.repository.interface");
const report_filter_repository_interface_1 = require("./domain/repositories/report-filter.repository.interface");
const report_sorting_repository_interface_1 = require("./domain/repositories/report-sorting.repository.interface");
const report_formula_repository_interface_1 = require("./domain/repositories/report-formula.repository.interface");
const report_aggregate_repository_interface_1 = require("./domain/repositories/report-aggregate.repository.interface");
const report_group_repository_1 = require("./infrastructure/repositories/report-group.repository");
const report_repository_1 = require("./infrastructure/repositories/report.repository");
const report_field_repository_1 = require("./infrastructure/repositories/report-field.repository");
const report_grouping_repository_1 = require("./infrastructure/repositories/report-grouping.repository");
const report_filter_repository_1 = require("./infrastructure/repositories/report-filter.repository");
const report_sorting_repository_1 = require("./infrastructure/repositories/report-sorting.repository");
const report_user_data_repository_1 = require("./infrastructure/repositories/report-user-data.repository");
const report_formula_repository_1 = require("./infrastructure/repositories/report-formula.repository");
const report_aggregate_repository_1 = require("./infrastructure/repositories/report-aggregate.repository");
const report_group_service_1 = require("./application/services/report-group.service");
const report_service_1 = require("./application/services/report.service");
const report_user_data_service_1 = require("./application/services/report-user-data.service");
const report_group_controller_1 = require("./presentation/controllers/report-group.controller");
const report_controller_1 = require("./presentation/controllers/report.controller");
const report_user_data_controller_1 = require("./presentation/controllers/report-user-data.controller");
let RptModule = class RptModule {
};
exports.RptModule = RptModule;
exports.RptModule = RptModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                report_group_entity_1.ReportGroup,
                report_entity_1.Report,
                report_field_entity_1.ReportField,
                report_grouping_entity_1.ReportGrouping,
                report_filter_entity_1.ReportFilter,
                report_sorting_entity_1.ReportSorting,
                report_permission_entity_1.ReportPermission,
                report_user_data_entity_1.ReportUserData,
                report_formula_entity_1.ReportFormula,
                report_aggregate_entity_1.ReportAggregate
            ]),
            common_module_1.CommonModule,
            core_module_1.CoreModule
        ],
        controllers: [
            report_group_controller_1.ReportGroupController,
            report_controller_1.ReportController,
            report_user_data_controller_1.ReportUserDataController
        ],
        providers: [
            { provide: report_group_repository_interface_1.IReportGroupRepository, useClass: report_group_repository_1.ReportGroupRepository },
            { provide: report_repository_interface_1.IReportRepository, useClass: report_repository_1.ReportRepository },
            { provide: report_field_repository_interface_1.IReportFieldRepository, useClass: report_field_repository_1.ReportFieldRepository },
            { provide: report_grouping_repository_interface_1.IReportGroupingRepository, useClass: report_grouping_repository_1.ReportGroupingRepository },
            { provide: report_filter_repository_interface_1.IReportFilterRepository, useClass: report_filter_repository_1.ReportFilterRepository },
            { provide: report_sorting_repository_interface_1.IReportSortingRepository, useClass: report_sorting_repository_1.ReportSortingRepository },
            { provide: report_formula_repository_interface_1.IReportFormulaRepository, useClass: report_formula_repository_1.ReportFormulaRepository },
            { provide: report_aggregate_repository_interface_1.IReportAggregateRepository, useClass: report_aggregate_repository_1.ReportAggregateRepository },
            { provide: 'ReportUserDataRepositoryInterface', useClass: report_user_data_repository_1.ReportUserDataRepository },
            report_group_service_1.ReportGroupService,
            report_service_1.ReportService,
            report_user_data_service_1.ReportUserDataService
        ],
        exports: [
            report_group_service_1.ReportGroupService,
            report_service_1.ReportService,
            report_user_data_service_1.ReportUserDataService
        ]
    })
], RptModule);
//# sourceMappingURL=rpt.module.js.map