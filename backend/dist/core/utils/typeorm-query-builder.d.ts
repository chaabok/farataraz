import { SelectQueryBuilder } from 'typeorm';
export declare function toLatinDigits(value: any): any;
export interface QueryParams {
    pageIndex?: number;
    pageSize?: number;
    sorting?: string;
    columnFilters?: string;
    globalFilter?: string;
    advancedFilters?: string;
}
export declare function applyDataGridParams<T>(queryBuilder: SelectQueryBuilder<T>, params: QueryParams, alias?: string, options?: {
    skipPagination?: boolean;
}): SelectQueryBuilder<T>;
