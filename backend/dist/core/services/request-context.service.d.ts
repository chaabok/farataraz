export declare class RequestContextService {
    private static readonly als;
    static getStore(): Map<string, any>;
    static run(store: Map<string, any>, callback: () => any): any;
    setUserId(userId: number): void;
    getUserId(): number | null;
    getBusinessStructureId(): number | null;
    getCompanyId(): number | null;
    getFiscalYearId(): number | null;
}
