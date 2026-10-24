import { IDetailedAccountsNumberingRepository } from '../../domain/repositories/detailed-accounts-numbering.repository.interface';
import { DetailedAccountsNumbering } from '../../domain/entities/detailed-accounts-numbering.entity';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export interface DetailedAccountsNumberingView {
    id: number;
    detailedTypesId: number;
    detailedTypeCode: string;
    detailedTypeTitle: string;
    isHeadquarterSelected: boolean;
    isCompanySelected: boolean;
    startNumber: number;
    endNumber: number;
}
export declare class DetailedAccountsNumberingService {
    private readonly repo;
    private readonly detailedTypeService;
    private readonly detailedAccountService;
    private readonly requestContextService;
    constructor(repo: IDetailedAccountsNumberingRepository, detailedTypeService: DetailedTypeService, detailedAccountService: DetailedAccountService, requestContextService: RequestContextService);
    getViewList(): Promise<DetailedAccountsNumberingView[]>;
    saveList(dataList: Partial<DetailedAccountsNumbering>[]): Promise<void>;
    getNextCode(detailedTypesId: number): Promise<string>;
}
