export declare class ReportFieldDto {
    reportFieldID?: string;
    tableName?: string;
    fieldName?: string;
    alias?: string;
    orderIndex?: number;
    isVisible?: boolean;
}
export declare class ReportGroupingDto {
    reportGroupingID?: string;
    tableName?: string;
    fieldName?: string;
    orderIndex?: number;
}
export declare class ReportFilterDto {
    reportFilterID?: string;
    tableName?: string;
    fieldName?: string;
    operator?: string;
    valueType?: string;
    value?: string;
    logicalOperator?: string;
    orderIndex?: number;
}
export declare class ReportSortingDto {
    reportSortingID?: string;
    tableName?: string;
    fieldName?: string;
    sortDirection?: string;
    orderIndex?: number;
}
export declare class ReportFormulaDto {
    reportFormulaID?: string;
    formulaName?: string;
    expression?: string;
}
export declare class ReportAggregateDto {
    reportAggregateID?: string;
    field?: string;
    groupBy?: string;
    printPosition?: string;
    hasPageTotal?: boolean;
    hasGrandTotal?: boolean;
}
export declare class UpsertReportDto {
    reportID?: string;
    reportGroupRef?: string;
    title?: string;
    direction?: string;
    paperSize?: string;
    paperOrientation?: string;
    showInstitutionName?: boolean;
    showDate?: boolean;
    showRowNumber?: boolean;
    showFilters?: boolean;
    pageNumberType?: string;
    showLogo?: boolean;
    hideDuplicates?: boolean;
    dataSourceType?: string;
    primaryTable?: string;
    targetForm?: string;
    isDefaultTemplate?: boolean;
    isSystemReport?: boolean;
    sqlScript?: string;
    fields?: ReportFieldDto[];
    groupings?: ReportGroupingDto[];
    filters?: ReportFilterDto[];
    sortings?: ReportSortingDto[];
    formulas?: ReportFormulaDto[];
    aggregates?: ReportAggregateDto[];
}
