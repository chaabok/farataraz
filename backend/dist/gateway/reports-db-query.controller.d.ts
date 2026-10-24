interface DbQueryField {
    name?: string;
    foreignTable?: string;
    foreignSchema?: string;
    foreignPK?: string;
    childrenFields?: DbQueryField[];
    [key: string]: any;
}
interface DbQueryBody {
    action?: string;
    script?: string;
    tableName?: string;
    fields?: DbQueryField[];
    params?: Record<string, any>;
}
export declare class ReportsDbQueryController {
    private readonly logger;
    query(data?: DbQueryBody): Promise<any>;
    private runQuery;
}
export {};
