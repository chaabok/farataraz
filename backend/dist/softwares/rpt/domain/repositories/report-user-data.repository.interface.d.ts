import { ReportUserData } from '../entities/report-user-data.entity';
export interface ReportUserDataRepositoryInterface {
    create(data: Partial<ReportUserData>): Promise<ReportUserData>;
    findAll(authInfo: any): Promise<ReportUserData[]>;
    findByReportName(reportName: string, authInfo: any): Promise<ReportUserData[]>;
    update(id: string, data: Partial<ReportUserData>): Promise<ReportUserData>;
    delete(id: string): Promise<void>;
    findByDynamicKey(reportName: string, dynamicKey: string, authInfo: any): Promise<ReportUserData>;
}
