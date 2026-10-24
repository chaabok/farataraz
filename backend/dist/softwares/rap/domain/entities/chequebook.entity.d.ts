import { AppBaseEntity } from "../../../../core/entities/app-base.entity";
import { BankAccount } from "./bank-account.entity";
import { ChequebookItem } from "./chequebook-item.entity";
export declare class Chequebook extends AppBaseEntity {
    chequebookId: number;
    bankAccount: BankAccount;
    bankAccountRef: number;
    series: string;
    leafCount: number;
    startSerial: number;
    isActive: boolean;
    items: ChequebookItem[];
}
