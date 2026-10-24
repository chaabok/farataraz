import { SelectQueryBuilder, ILike, IsNull, Not, Brackets } from 'typeorm';

export interface QueryParams {
  pageIndex?: number;
  pageSize?: number;
  sorting?: string; // JSON string of SortingState
  columnFilters?: string; // JSON string of ColumnFiltersState
  globalFilter?: string;
  advancedFilters?: string; // JSON string of AdvancedFilterCondition[]
}

export function applyDataGridParams<T>(
  queryBuilder: SelectQueryBuilder<T>,
  params: QueryParams,
  alias: string = 'entity'
) {
  const { pageIndex = 0, pageSize = 50, sorting, columnFilters, globalFilter, advancedFilters } = params;

  // Pagination
  queryBuilder.skip(pageIndex * pageSize).take(pageSize);

  // Sorting
  if (sorting && sorting !== 'undefined' && sorting !== 'null') {
    try {
      const sortState = typeof sorting === 'string' ? (sorting.trim() !== '' ? JSON.parse(sorting) : []) : sorting;
      if (Array.isArray(sortState) && sortState.length > 0) {
        sortState.forEach((s, index) => {
          // If the field contains a dot (e.g. relation.field), use it directly without alias to avoid 'entity.relation.field' errors
          const fieldName = s.id.includes('.') ? s.id : `${alias}.${s.id}`;
          
          if (index === 0) {
            queryBuilder.orderBy(fieldName, s.desc ? 'DESC' : 'ASC');
          } else {
            queryBuilder.addOrderBy(fieldName, s.desc ? 'DESC' : 'ASC');
          }
        });
      }
    } catch (e) {
      console.error('Failed to parse sorting params', e);
    }
  }

  // Column Filters
  if (columnFilters && columnFilters !== 'undefined' && columnFilters !== 'null') {
    try {
      const filters = typeof columnFilters === 'string' ? (columnFilters.trim() !== '' ? JSON.parse(columnFilters) : []) : columnFilters;
      if (Array.isArray(filters)) {
        filters.forEach((f) => {
          const val = f.value;
          if (typeof val === 'object' && val !== null && 'op' in val) {
            const op = val.op;
            const filterValue = val.value;
            const field = `${alias}.${f.id}`;

            switch (op) {
              case 'contains':
                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${f.id}`, { [`val_${f.id}`]: `%${filterValue}%` });
                break;
              case 'notContains':
                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) NOT ILIKE :val_${f.id}`, { [`val_${f.id}`]: `%${filterValue}%` });
                break;
              case 'startsWith':
                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${f.id}`, { [`val_${f.id}`]: `${filterValue}%` });
                break;
              case 'endsWith':
                queryBuilder.andWhere(`CAST(${field} AS VARCHAR) ILIKE :val_${f.id}`, { [`val_${f.id}`]: `%${filterValue}` });
                break;
              case 'equals':
                queryBuilder.andWhere(`${field} = :val_${f.id}`, { [`val_${f.id}`]: filterValue });
                break;
              case 'notEquals':
                queryBuilder.andWhere(`${field} != :val_${f.id}`, { [`val_${f.id}`]: filterValue });
                break;
              case 'in':
                queryBuilder.andWhere(`${field} IN (:...val_${f.id})`, { [`val_${f.id}`]: Array.isArray(filterValue) ? (filterValue.length > 0 ? filterValue : [-1]) : [filterValue] });
                break;
              case 'notIn':
                queryBuilder.andWhere(`${field} NOT IN (:...val_${f.id})`, { [`val_${f.id}`]: Array.isArray(filterValue) ? (filterValue.length > 0 ? filterValue : [-1]) : [filterValue] });
                break;
              case 'empty':
                queryBuilder.andWhere(`(${field} IS NULL OR CAST(${field} AS VARCHAR) = '')`);
                break;
              case 'notEmpty':
                queryBuilder.andWhere(`(${field} IS NOT NULL AND CAST(${field} AS VARCHAR) != '')`);
                break;
            }
          } else if (typeof val === 'string' && val.trim() !== '') {
            queryBuilder.andWhere(`CAST(${alias}.${f.id} AS VARCHAR) ILIKE :val_${f.id}`, { [`val_${f.id}`]: `%${val}%` });
          }
        });
      }
    } catch (e) {
      console.error('Failed to parse column filters', e);
    }
  }

  // Advanced Filters
  if (advancedFilters && advancedFilters !== 'undefined' && advancedFilters !== 'null') {
    try {
      const filters = typeof advancedFilters === 'string' ? (advancedFilters.trim() !== '' ? JSON.parse(advancedFilters) : []) : advancedFilters;
      if (Array.isArray(filters) && filters.length > 0) {
        queryBuilder.andWhere(new Brackets((qb) => {
          filters.forEach((f, index) => {
            const field = `${alias}.${f.columnId}`;
            const op = f.operator;
            const filterValue = f.value;
            const paramName = `adv_${f.id}`;
            let conditionString = "";
            let sqlParams: Record<string, any> = {};

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
              } else if (f.logicalOp === 'or') {
                qb.orWhere(conditionString, sqlParams);
              } else {
                qb.andWhere(conditionString, sqlParams);
              }
            }
          });
        }));
      }
    } catch (e) {
      console.error('Failed to parse advanced filters', e);
    }
  }

  // Global Filter (basic implementation, usually searches all text columns)
  // This requires knowing which columns to search, so it might be better handled per entity
  // Or just pass a list of searchable columns

  return queryBuilder;
}
