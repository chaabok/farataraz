import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { Chequebook } from "./chequebook.entity";
export declare enum CheckStatus {
    NORMAL = 1,
    CANCELED = 2,
    ISSUED = 3,
    PASSED = 4
}
export declare class ChequebookItem extends AppBaseEntity {
    chequebookItemId: number;
    chequebook: Chequebook;
    chequebookRef: number;
    checkNumber: number;
    receiver: string;
    issueDate: string;
    amount: number;
    status: CheckStatus;
}
