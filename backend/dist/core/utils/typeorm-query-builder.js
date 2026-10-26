"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toLatinDigits = toLatinDigits;
exports.applyDataGridParams = applyDataGridParams;
const typeorm_1 = require("typeorm");
function toLatinDigits(value) {
    if (typeof value !== 'string')
        return value;
    return value
        .replace(/[\u06F0-\u06F9]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x06f0 + 48))
        .replace(/[\u0660-\u0669]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0660 + 48))
        .replace(/[\u0966-\u096F]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x0966 + 48))
        .replace(/[\uFF10-\uFF19]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xff10 + 48));
}
function applyDataGridParams(queryBuilder, params, alias = 'entity', options) {
    const { pageIndex = 0, pageSize = 50, sorting, columnFilters, globalFilter, advancedFilters } = params;
    if (!options?.skipPagination) {
        queryBuilder.skip(pageIndex * pageSize).take(pageSize);
    }
    if (sorting && sorting !== 'undefined' && sorting !== 'null') {
        try {
            const sortState = typeof sorting === 'string' ? (sorting.trim() !== '' ? JSON.parse(sorting) : []) : sorting;
            if (Array.isArray(sortState) && sortState.length > 0) {
                sortState.forEach((s, index) => {
                    const fieldName = s.id.includes('.') ? s.id : `${alias}.${s.id}`;
                    if (index === 0) {
                        queryBuilder.orderBy(fieldName, s.desc ? 'DESC' : 'ASC');
                    }
                    else {
                        queryBuilder.addOrderBy(fieldName, s.desc ? 'DESC' : 'ASC');
                    }
                });
            }
        }
        catch (e) {
            console.error('Failed to parse sorting params', e);
        }
    }
    if (columnFilters && columnFilters !== 'undefined' && columnFilters !== 'null') {
        try {
            const filters = typeof columnFilters === 'string' ? (columnFilters.trim() !== '' ? JSON.parse(columnFilters) : []) : columnFilters;
            if (Array.isArray(filters)) {
                filters.forEach((f) => {
                    const val = f.value;
                    const field = String(f.id).includes('.') ? f.id : `${alias}.${f.id}`;
                    const safeId = String(f.id).replace(/\./g, '_');
                    if (typeof val === 'object' && val !== null && 'op' in val) {
                        const op = val.op === 'isEmpty' ? 'empty' : val.op === 'isNotEmpty' ? 'notEmpty' : val.op;
                        const filterValue = toLatinDigits(val.value);
                        switch (op) {
                            case 'contains':
                                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${safeId}`, { [`val_${safeId}`]: `%${filterValue}%` });
                                break;
                            case 'notContains':
                                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) NOT ILIKE :val_${safeId}`, { [`val_${safeId}`]: `%${filterValue}%` });
                                break;
                            case 'startsWith':
                                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${safeId}`, { [`val_${safeId}`]: `${filterValue}%` });
                                break;
                            case 'endsWith':
                                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${safeId}`, { [`val_${safeId}`]: `%${filterValue}` });
                                break;
                            case 'equals':
                                queryBuilder.andWhere(`${field} = :val_${safeId}`, { [`val_${safeId}`]: filterValue });
                                break;
                            case 'notEquals':
                                queryBuilder.andWhere(`${field} != :val_${safeId}`, { [`val_${safeId}`]: filterValue });
                                break;
                            case 'in':
                                queryBuilder.andWhere(`${field} IN (:...val_${safeId})`, { [`val_${safeId}`]: Array.isArray(filterValue) ? (filterValue.length > 0 ? filterValue : [-1]) : [filterValue] });
                                break;
                            case 'notIn':
                                queryBuilder.andWhere(`${field} NOT IN (:...val_${safeId})`, { [`val_${safeId}`]: Array.isArray(filterValue) ? (filterValue.length > 0 ? filterValue : [-1]) : [filterValue] });
                                break;
                            case 'empty':
                                queryBuilder.andWhere(`(${field} IS NULL OR CAST(${field} AS VARCHAR) = '')`);
                                break;
                            case 'notEmpty':
                                queryBuilder.andWhere(`(${field} IS NOT NULL AND CAST(${field} AS VARCHAR) != '')`);
                                break;
                        }
                    }
                    else if (typeof val === 'string' && val.trim() !== '') {
                        queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${safeId}`, { [`val_${safeId}`]: `%${toLatinDigits(val)}%` });
                    }
                });
            }
        }
        catch (e) {
            console.error('Failed to parse column filters', e);
        }
    }
    if (advancedFilters && advancedFilters !== 'undefined' && advancedFilters !== 'null') {
        try {
            const filters = typeof advancedFilters === 'string' ? (advancedFilters.trim() !== '' ? JSON.parse(advancedFilters) : []) : advancedFilters;
            if (Array.isArray(filters) && filters.length > 0) {
                queryBuilder.andWhere(new typeorm_1.Brackets((qb) => {
                    filters.forEach((f, index) => {
                        const field = String(f.columnId).includes('.') ? f.columnId : `${alias}.${f.columnId}`;
                        const op = f.operator === 'isEmpty' ? 'empty' : f.operator === 'isNotEmpty' ? 'notEmpty' : f.operator;
                        const filterValue = toLatinDigits(f.value);
                        const paramName = `adv_${String(f.id).replace(/\./g, '_')}`;
                        let conditionString = "";
                        let sqlParams = {};
                        switch (op) {
                            case 'contains':
                                conditionString = `CAST(${field} AS VARCHAR) ILIKE :${paramName}`;
                                sqlParams = { [paramName]: `%${filterValue}%` };
                                break;
                            case 'notContains':
                                conditionString = `CAST(${field} AS VARCHAR) NOT ILIKE :${paramName}`;
                                sqlParams = { [paramName]: `%${filterValue}%` };
                                break;
                            case 'startsWith':
                                conditionString = `CAST(${field} AS VARCHAR) ILIKE :${paramName}`;
                                sqlParams = { [paramName]: `${filterValue}%` };
                                break;
                            case 'endsWith':
                                conditionString = `CAST(${field} AS VARCHAR) ILIKE :${paramName}`;
                                sqlParams = { [paramName]: `%${filterValue}` };
                                break;
                            case 'equals':
                                conditionString = `${field} = :${paramName}`;
                                sqlParams = { [paramName]: filterValue };
                                break;
                            case 'notEquals':
                                conditionString = `${field} != :${paramName}`;
                                sqlParams = { [paramName]: filterValue };
                                break;
                            case 'empty':
                                conditionString = `(${field} IS NULL OR CAST(${field} AS VARCHAR) = '')`;
                                break;
                            case 'notEmpty':
                                conditionString = `(${field} IS NOT NULL AND CAST(${field} AS VARCHAR) != '')`;
                                break;
                        }
                        if (conditionString) {
                            if (index === 0) {
                                qb.andWhere(conditionString, sqlParams);
                            }
                            else if (f.logicalOp === 'or') {
                                qb.orWhere(conditionString, sqlParams);
                            }
                            else {
                                qb.andWhere(conditionString, sqlParams);
                            }
                        }
                    });
                }));
            }
        }
        catch (e) {
            console.error('Failed to parse advanced filters', e);
        }
    }
    return queryBuilder;
}
//# sourceMappingURL=typeorm-query-builder.js.map