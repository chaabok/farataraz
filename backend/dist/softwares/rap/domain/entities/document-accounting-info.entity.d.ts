import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class DocumentAccountingInfo extends AppBaseEntity {
    documentAccountingInfoId: number;
    documentType: string;
    documentRef: number;
    rowType: string;
    rowRef: number;
    opDetail1Ref: number;
    opDetail2Ref: number;
    opDetail3Ref: number;
    opDetail4Ref: number;
    opDetail5Ref: number;
    opDetail6Ref: number;
    forDetail1Ref: number;
    forDetail2Ref: number;
    forDetail3Ref: number;
    forDetail4Ref: number;
    forDetail5Ref: number;
    forDetail6Ref: number;
}
