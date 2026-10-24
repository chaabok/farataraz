import { DataSource } from 'typeorm';
export declare function toJalaliDateString(val: any): string;
export declare function validateStocktakingTagLock(dataSource: DataSource, warehouseRefs: (number | string | undefined | null)[], documentDate: any): Promise<void>;
