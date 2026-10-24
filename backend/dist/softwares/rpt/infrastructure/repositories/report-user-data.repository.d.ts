import { Repository } from 'typeorm';
import { ReportUserData } from '../../domain/entities/report-user-data.entity';
import { ReportUserDataRepositoryInterface } from '../../domain/repositories/report-user-data.repository.interface';
export declare class ReportUserDataRepository implements ReportUserDataRepositoryInterface {
    private readonly repository;
    constructor(repository: Repository<ReportUserData>);
    create(data: Partial<ReportUserData>): Promise<ReportUserData>;
    findAll(authInfo: any): Promise<ReportUserData[]>;
    findByReportName(reportName: string, authInfo: any): Promise<ReportUserData[]>;
    findByDynamicKey(reportName: string, dynamicKey: string, authInfo: any): Promise<ReportUserData>;
    update(id: string, data: Partial<ReportUserData>): Promise<ReportUserData>;
    delete(id: string): Promise<void>;
}
